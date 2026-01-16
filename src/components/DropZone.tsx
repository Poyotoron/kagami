import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS, ACCEPTED_INPUT_FORMATS } from '../types';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const validateAndFilterFiles = useCallback((files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (ACCEPTED_INPUT_FORMATS.includes(file.type)) {
        validFiles.push(file);
      }
    }

    return validFiles;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      const validFiles = validateAndFilterFiles(files);

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [disabled, onFilesAdded, validateAndFilterFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const validFiles = validateAndFilterFiles(files);
        if (validFiles.length > 0) {
          onFilesAdded(validFiles);
        }
      }
      // Reset input to allow selecting the same file again
      e.target.value = '';
    },
    [onFilesAdded, validateAndFilterFiles]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="画像ファイルをドロップまたはクリックして選択"
      aria-disabled={disabled}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className={`w-8 h-8 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            {isDragOver ? 'ここにドロップ' : '画像をドロップ、またはクリックして選択'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            JPEG, PNG, WebP, GIF, BMP, SVG に対応
          </p>
        </div>
      </div>
    </div>
  );
}
