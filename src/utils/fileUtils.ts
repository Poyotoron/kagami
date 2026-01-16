import { saveAs } from 'file-saver';
import type { ImageFile, ImageFormat } from '../types';
import { generateOutputFilename } from './imageProcessor';

export function downloadImage(image: ImageFile, format: ImageFormat): void {
  if (!image.convertedBlob) {
    console.error('No converted blob available');
    return;
  }

  const filename = generateOutputFilename(image.originalFile.name, format);
  saveAs(image.convertedBlob, filename);
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
