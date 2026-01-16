import type { ImageFile } from '../types';
import { ImageItem } from './ImageItem';

interface ImageListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onDownload: (image: ImageFile) => void;
  onDownloadAll: () => void;
  onConvertAll: () => void;
  isConverting: boolean;
}

export function ImageList({
  images,
  onRemove,
  onDownload,
  onDownloadAll,
  onConvertAll,
  isConverting,
}: ImageListProps) {
  if (images.length === 0) {
    return null;
  }

  const completedCount = images.filter((img) => img.status === 'completed').length;
  const hasCompletedImages = completedCount > 0;
  const hasPendingImages = images.some((img) => img.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          画像一覧 ({images.length}件)
        </h2>
        <div className="flex gap-2">
          {hasPendingImages && (
            <button
              onClick={onConvertAll}
              disabled={isConverting}
              className={`
                px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium
                hover:bg-blue-600 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isConverting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  変換中...
                </span>
              ) : (
                'すべて変換'
              )}
            </button>
          )}
          {hasCompletedImages && (
            <button
              onClick={onDownloadAll}
              disabled={isConverting}
              className={`
                px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium
                hover:bg-green-600 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              一括ダウンロード ({completedCount})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {images.map((image) => (
          <ImageItem
            key={image.id}
            image={image}
            onRemove={onRemove}
            onDownload={onDownload}
          />
        ))}
      </div>
    </div>
  );
}
