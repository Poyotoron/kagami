import type { ImageFormat, ConversionOptions } from '../types';

export interface WorkerMessage {
  type: 'convert';
  id: string;
  file: File;
  options: ConversionOptions;
}

export interface WorkerResponse {
  type: 'progress' | 'complete' | 'error';
  id: string;
  progress?: number;
  result?: {
    blob: Blob;
    width: number;
    height: number;
  };
  error?: string;
}

const FORMAT_MIME_TYPES: Record<ImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number | null,
  targetHeight: number | null,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  if (!targetWidth && !targetHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  if (targetWidth && targetHeight && !maintainAspectRatio) {
    return { width: targetWidth, height: targetHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  }

  if (!targetWidth && targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  }

  if (targetWidth && targetHeight && maintainAspectRatio) {
    const widthRatio = targetWidth / originalWidth;
    const heightRatio = targetHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio),
    };
  }

  return { width: originalWidth, height: originalHeight };
}

async function convertImageInWorker(
  id: string,
  file: File,
  options: ConversionOptions
): Promise<void> {
  try {
    // Report start
    self.postMessage({
      type: 'progress',
      id,
      progress: 10,
    } as WorkerResponse);

    // Create ImageBitmap from file
    const bitmap = await createImageBitmap(file);

    self.postMessage({
      type: 'progress',
      id,
      progress: 30,
    } as WorkerResponse);

    // Calculate target dimensions
    const { width, height } = options.resize
      ? calculateDimensions(
          bitmap.width,
          bitmap.height,
          options.resize.width,
          options.resize.height,
          options.resize.maintainAspectRatio
        )
      : { width: bitmap.width, height: bitmap.height };

    // Create OffscreenCanvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas コンテキストの取得に失敗しました');
    }

    self.postMessage({
      type: 'progress',
      id,
      progress: 50,
    } as WorkerResponse);

    // Fill with white background for JPEG
    if (options.format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw the image
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    self.postMessage({
      type: 'progress',
      id,
      progress: 70,
    } as WorkerResponse);

    // Convert to blob
    const mimeType = FORMAT_MIME_TYPES[options.format];
    const quality = options.format === 'png' ? undefined : options.quality / 100;

    const blob = await canvas.convertToBlob({
      type: mimeType,
      quality,
    });

    self.postMessage({
      type: 'progress',
      id,
      progress: 90,
    } as WorkerResponse);

    // Send completed result
    self.postMessage({
      type: 'complete',
      id,
      progress: 100,
      result: {
        blob,
        width,
        height,
      },
    } as WorkerResponse);

  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : '変換に失敗しました',
    } as WorkerResponse);
  }
}

// Listen for messages from the main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, id, file, options } = event.data;

  if (type === 'convert') {
    await convertImageInWorker(id, file, options);
  }
};
