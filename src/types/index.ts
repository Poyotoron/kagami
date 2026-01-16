export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface ConversionOptions {
  format: ImageFormat;
  quality: number; // 1-100
  resize: ResizeOptions | null;
  maxFileSize: number | null; // bytes
}

export interface ResizeOptions {
  width: number | null;
  height: number | null;
  maintainAspectRatio: boolean;
}

export interface ImageFile {
  id: string;
  originalFile: File;
  originalUrl: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error: string | null;
  originalSize: number;
  convertedSize: number | null;
}

export const ACCEPTED_INPUT_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
];

export const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg';

export const DEFAULT_CONVERSION_OPTIONS: ConversionOptions = {
  format: 'webp',
  quality: 80,
  resize: null,
  maxFileSize: null,
};
