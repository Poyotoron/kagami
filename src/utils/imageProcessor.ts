import type { ConversionOptions, ImageFormat } from '../types';

const FORMAT_MIME_TYPES: Record<ImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export interface ConversionResult {
  blob: Blob;
  url: string;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    img.src = URL.createObjectURL(file);
  });
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number | null,
  targetHeight: number | null,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  // No resize specified
  if (!targetWidth && !targetHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  // Both dimensions specified without maintaining aspect ratio
  if (targetWidth && targetHeight && !maintainAspectRatio) {
    return { width: targetWidth, height: targetHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  // Only width specified or maintaining aspect ratio with width
  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  }

  // Only height specified or maintaining aspect ratio with height
  if (!targetWidth && targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  }

  // Both specified with maintaining aspect ratio - fit within bounds
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

export async function convertImage(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  const img = await loadImage(file);

  // Calculate target dimensions
  const { width, height } = options.resize
    ? calculateDimensions(
        img.naturalWidth,
        img.naturalHeight,
        options.resize.width,
        options.resize.height,
        options.resize.maintainAspectRatio
      )
    : { width: img.naturalWidth, height: img.naturalHeight };

  // Create canvas and draw image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas コンテキストの取得に失敗しました');
  }

  // Fill with white background for JPEG (no transparency support)
  if (options.format === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Clean up the original image URL
  URL.revokeObjectURL(img.src);

  // Convert to blob
  const mimeType = FORMAT_MIME_TYPES[options.format];
  const quality = options.format === 'png' ? undefined : options.quality / 100;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        } else {
          reject(new Error('画像の変換に失敗しました'));
        }
      },
      mimeType,
      quality
    );
  });
}

export function generateOutputFilename(
  originalName: string,
  format: ImageFormat
): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const extension = format === 'jpeg' ? 'jpg' : format;
  return `${nameWithoutExt}.${extension}`;
}
