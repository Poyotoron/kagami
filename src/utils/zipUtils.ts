import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ImageFile, ImageFormat } from '../types';
import { generateOutputFilename } from './imageProcessor';

export async function downloadAsZip(
  images: ImageFile[],
  format: ImageFormat
): Promise<void> {
  const completedImages = images.filter(
    (img) => img.status === 'completed' && img.convertedBlob
  );

  if (completedImages.length === 0) {
    throw new Error('ダウンロードできる画像がありません');
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const image of completedImages) {
    if (!image.convertedBlob) continue;

    let filename = generateOutputFilename(image.originalFile.name, format);

    // Handle duplicate filenames
    if (usedNames.has(filename)) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      const extension = filename.split('.').pop();
      let counter = 1;
      while (usedNames.has(filename)) {
        filename = `${nameWithoutExt}_${counter}.${extension}`;
        counter++;
      }
    }

    usedNames.add(filename);
    zip.file(filename, image.convertedBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(zipBlob, `kagami_${timestamp}.zip`);
}
