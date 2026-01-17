import type { ImageFile } from '../types';

interface ImageItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onDownload: (image: ImageFile) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

function calculateReduction(original: number, converted: number): string {
  const reduction = ((original - converted) / original) * 100;
  return reduction > 0 ? `-${reduction.toFixed(0)}%` : `+${Math.abs(reduction).toFixed(0)}%`;
}

export function ImageItem({ image, onRemove, onDownload }: ImageItemProps) {
  const isProcessing = image.status === 'processing';
  const isCompleted = image.status === 'completed';
  const hasError = image.status === 'error';

  const getStatusText = () => {
    switch (image.status) {
      case 'pending':
        return '変換待ち';
      case 'processing':
        return `変換中 ${image.progress}%`;
      case 'completed':
        return '変換完了';
      case 'error':
        return `エラー: ${image.error || '変換に失敗しました'}`;
      default:
        return '';
    }
  };

  return (
    <article
      aria-label={`${image.originalFile.name} - ${getStatusText()}`}
      className={`
        flex items-center gap-4 p-4 bg-white rounded-xl border
        ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}
      `}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={image.convertedUrl || image.originalUrl}
          alt={image.originalFile.name}
          className="w-full h-full object-cover"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate" title={image.originalFile.name}>
          {image.originalFile.name}
        </p>
        <div className="text-sm text-gray-500 mt-1">
          {isProcessing && (
            <div className="space-y-1">
              <span className="text-blue-500">変換中... {image.progress}%</span>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${image.progress}%` }}
                  role="progressbar"
                  aria-valuenow={image.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`変換進捗: ${image.progress}%`}
                />
              </div>
            </div>
          )}
          {hasError && (
            <span className="text-red-500">
              エラー: {image.error || '変換に失敗しました'}
            </span>
          )}
          {isCompleted && image.convertedSize !== null && (
            <span>
              {formatFileSize(image.originalSize)} → {formatFileSize(image.convertedSize)}
              <span
                className={
                  image.convertedSize < image.originalSize
                    ? 'text-green-600 ml-2'
                    : 'text-orange-500 ml-2'
                }
              >
                ({calculateReduction(image.originalSize, image.convertedSize)})
              </span>
            </span>
          )}
          {image.status === 'pending' && (
            <span>{formatFileSize(image.originalSize)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0" role="group" aria-label="ファイル操作">
        {isCompleted && (
          <button
            onClick={() => onDownload(image)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`${image.originalFile.name}をダウンロード`}
            title="ダウンロード"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        )}
        <button
          onClick={() => onRemove(image.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`${image.originalFile.name}を削除`}
          title="削除"
          disabled={isProcessing}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}
