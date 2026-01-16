import { useState, useCallback } from 'react';
import type { ImageFile, ConversionOptions } from '../types';
import { DEFAULT_CONVERSION_OPTIONS } from '../types';
import { convertImage } from '../utils/imageProcessor';
import { downloadImage, generateUniqueId } from '../utils/fileUtils';
import { downloadAsZip } from '../utils/zipUtils';

export function useImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ConversionOptions>(
    DEFAULT_CONVERSION_OPTIONS
  );
  const [isConverting, setIsConverting] = useState(false);

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
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        // Clean up URLs
        URL.revokeObjectURL(image.originalUrl);
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const convertSingleImage = useCallback(
    async (imageId: string): Promise<void> => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: 'processing', error: null }
            : img
        )
      );

      try {
        const image = images.find((img) => img.id === imageId);
        if (!image) return;

        const result = await convertImage(image.originalFile, options);

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  convertedBlob: result.blob,
                  convertedUrl: result.url,
                  convertedSize: result.blob.size,
                  status: 'completed',
                  error: null,
                }
              : img
          )
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  status: 'error',
                  error:
                    error instanceof Error
                      ? error.message
                      : '変換に失敗しました',
                }
              : img
          )
        );
      }
    },
    [images, options]
  );

  const convertAll = useCallback(async () => {
    setIsConverting(true);

    const pendingImages = images.filter((img) => img.status === 'pending');

    for (const image of pendingImages) {
      // Mark as processing
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, status: 'processing', error: null }
            : img
        )
      );

      try {
        const result = await convertImage(image.originalFile, options);

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  convertedBlob: result.blob,
                  convertedUrl: result.url,
                  convertedSize: result.blob.size,
                  status: 'completed',
                  error: null,
                }
              : img
          )
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'error',
                  error:
                    error instanceof Error
                      ? error.message
                      : '変換に失敗しました',
                }
              : img
          )
        );
      }
    }

    setIsConverting(false);
  }, [images, options]);

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
    // Clean up all URLs
    images.forEach((image) => {
      URL.revokeObjectURL(image.originalUrl);
      if (image.convertedUrl) {
        URL.revokeObjectURL(image.convertedUrl);
      }
    });
    setImages([]);
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
