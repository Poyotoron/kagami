import { useState, useCallback, useRef, useEffect } from 'react';
import type { ImageFile, ConversionOptions } from '../types';
import { DEFAULT_CONVERSION_OPTIONS } from '../types';
import { downloadImage, generateUniqueId } from '../utils/fileUtils';
import { downloadAsZip } from '../utils/zipUtils';
import type { WorkerMessage, WorkerResponse } from '../workers/imageWorker';
import ImageWorker from '../workers/imageWorker?worker';

export function useImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ConversionOptions>(
    DEFAULT_CONVERSION_OPTIONS
  );
  const [isConverting, setIsConverting] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const conversionQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  // Initialize and cleanup worker
  useEffect(() => {
    workerRef.current = new ImageWorker();

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, id, progress, result, error } = event.data;

      if (type === 'progress') {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? { ...img, progress: progress ?? 0 }
              : img
          )
        );
      } else if (type === 'complete' && result) {
        const url = URL.createObjectURL(result.blob);
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  convertedBlob: result.blob,
                  convertedUrl: url,
                  convertedSize: result.blob.size,
                  status: 'completed',
                  progress: 100,
                  error: null,
                }
              : img
          )
        );
        processNextInQueue();
      } else if (type === 'error') {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: 'error',
                  progress: 0,
                  error: error ?? '変換に失敗しました',
                }
              : img
          )
        );
        processNextInQueue();
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const processNextInQueue = useCallback(() => {
    if (conversionQueueRef.current.length === 0) {
      isProcessingRef.current = false;
      setIsConverting(false);
      return;
    }

    const nextId = conversionQueueRef.current.shift()!;

    setImages((prev) => {
      const image = prev.find((img) => img.id === nextId);
      if (image && workerRef.current) {
        const currentOptions = options;
        workerRef.current.postMessage({
          type: 'convert',
          id: nextId,
          file: image.originalFile,
          options: currentOptions,
        } as WorkerMessage);
      }
      return prev.map((img) =>
        img.id === nextId
          ? { ...img, status: 'processing', error: null, progress: 0 }
          : img
      );
    });
  }, [options]);

  const addFiles = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: generateUniqueId(),
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      convertedBlob: null,
      convertedUrl: null,
      status: 'pending',
      error: null,
      originalSize: file.size,
      convertedSize: null,
      progress: 0,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.originalUrl);
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
    // Remove from queue if present
    conversionQueueRef.current = conversionQueueRef.current.filter(
      (qId) => qId !== id
    );
  }, []);

  const convertSingleImage = useCallback(
    async (imageId: string): Promise<void> => {
      const image = images.find((img) => img.id === imageId);
      if (!image || !workerRef.current) return;

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: 'processing', error: null, progress: 0 }
            : img
        )
      );

      workerRef.current.postMessage({
        type: 'convert',
        id: imageId,
        file: image.originalFile,
        options,
      } as WorkerMessage);
    },
    [images, options]
  );

  const convertAll = useCallback(async () => {
    const pendingImages = images.filter((img) => img.status === 'pending');
    if (pendingImages.length === 0) return;

    setIsConverting(true);

    // Add all pending images to the queue
    conversionQueueRef.current = pendingImages.map((img) => img.id);

    // Start processing if not already
    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      processNextInQueue();
    }
  }, [images, processNextInQueue]);

  const handleDownload = useCallback(
    (image: ImageFile) => {
      downloadImage(image, options.format);
    },
    [options.format]
  );

  const handleDownloadAll = useCallback(async () => {
    try {
      await downloadAsZip(images, options.format);
    } catch (error) {
      console.error('ZIP download failed:', error);
    }
  }, [images, options.format]);

  const clearAll = useCallback(() => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.originalUrl);
      if (image.convertedUrl) {
        URL.revokeObjectURL(image.convertedUrl);
      }
    });
    setImages([]);
    conversionQueueRef.current = [];
    isProcessingRef.current = false;
    setIsConverting(false);
  }, [images]);

  return {
    images,
    options,
    isConverting,
    setOptions,
    addFiles,
    removeImage,
    convertSingleImage,
    convertAll,
    handleDownload,
    handleDownloadAll,
    clearAll,
  };
}
