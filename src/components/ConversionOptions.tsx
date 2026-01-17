import type { ConversionOptions as ConversionOptionsType, ImageFormat, ResizeOptions } from '../types';

interface ConversionOptionsProps {
  options: ConversionOptionsType;
  onChange: (options: ConversionOptionsType) => void;
  disabled?: boolean;
}

export function ConversionOptions({
  options,
  onChange,
  disabled = false,
}: ConversionOptionsProps) {
  const handleFormatChange = (format: ImageFormat) => {
    onChange({ ...options, format });
  };

  const handleQualityChange = (quality: number) => {
    onChange({ ...options, quality });
  };

  const handleResizeToggle = () => {
    if (options.resize) {
      onChange({ ...options, resize: null });
    } else {
      onChange({
        ...options,
        resize: { width: null, height: null, maintainAspectRatio: true },
      });
    }
  };

  const handleResizeChange = (resize: ResizeOptions) => {
    onChange({ ...options, resize });
  };

  const showQualitySlider = options.format === 'jpeg' || options.format === 'webp';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">変換オプション</h2>

      {/* Output Format */}
      <fieldset className="space-y-2">
        <legend className="block text-sm font-medium text-gray-700">
          出力形式
        </legend>
        <div className="flex gap-2" role="group" aria-label="出力フォーマットの選択">
          {(['jpeg', 'png', 'webp'] as ImageFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => handleFormatChange(format)}
              disabled={disabled}
              aria-pressed={options.format === format}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  options.format === format
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Quality Slider */}
      {showQualitySlider && (
        <div className="space-y-2">
          <label
            htmlFor="quality-slider"
            className="block text-sm font-medium text-gray-700"
          >
            品質: {options.quality}%
          </label>
          <input
            id="quality-slider"
            type="range"
            min="1"
            max="100"
            value={options.quality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            disabled={disabled}
            aria-valuemin={1}
            aria-valuemax={100}
            aria-valuenow={options.quality}
            aria-valuetext={`${options.quality}パーセント`}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500" aria-hidden="true">
            <span>低品質・小サイズ</span>
            <span>高品質・大サイズ</span>
          </div>
        </div>
      )}

      {/* Resize Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="resize-toggle"
            checked={options.resize !== null}
            onChange={handleResizeToggle}
            disabled={disabled}
            className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <label
            htmlFor="resize-toggle"
            className="text-sm font-medium text-gray-700"
          >
            リサイズ
          </label>
        </div>

        {options.resize && (
          <div className="ml-6 space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  htmlFor="resize-width"
                  className="block text-xs text-gray-500 mb-1"
                >
                  幅 (px)
                </label>
                <input
                  id="resize-width"
                  type="number"
                  placeholder="自動"
                  value={options.resize.width ?? ''}
                  onChange={(e) =>
                    handleResizeChange({
                      ...options.resize!,
                      width: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  disabled={disabled}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="resize-height"
                  className="block text-xs text-gray-500 mb-1"
                >
                  高さ (px)
                </label>
                <input
                  id="resize-height"
                  type="number"
                  placeholder="自動"
                  value={options.resize.height ?? ''}
                  onChange={(e) =>
                    handleResizeChange({
                      ...options.resize!,
                      height: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  disabled={disabled}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintain-aspect-ratio"
                checked={options.resize.maintainAspectRatio}
                onChange={(e) =>
                  handleResizeChange({
                    ...options.resize!,
                    maintainAspectRatio: e.target.checked,
                  })
                }
                disabled={disabled}
                className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <label
                htmlFor="maintain-aspect-ratio"
                className="text-sm text-gray-600"
              >
                アスペクト比を維持
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
