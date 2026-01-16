import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { ConversionOptions } from './components/ConversionOptions';
import { ImageList } from './components/ImageList';
import { useImageConverter } from './hooks/useImageConverter';

function App() {
  const {
    images,
    options,
    isConverting,
    setOptions,
    addFiles,
    removeImage,
    convertAll,
    handleDownload,
    handleDownloadAll,
    clearAll,
  } = useImageConverter();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Drop Zone */}
        <section className="mb-8">
          <DropZone onFilesAdded={addFiles} disabled={isConverting} />
        </section>

        {/* Main Content Area */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversion Options */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                <ConversionOptions
                  options={options}
                  onChange={setOptions}
                  disabled={isConverting}
                />
                {images.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={isConverting}
                    className="w-full px-4 py-2 text-red-500 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    すべてクリア
                  </button>
                )}
              </div>
            </aside>

            {/* Image List */}
            <section className="lg:col-span-2">
              <ImageList
                images={images}
                onRemove={removeImage}
                onDownload={handleDownload}
                onDownloadAll={handleDownloadAll}
                onConvertAll={convertAll}
                isConverting={isConverting}
              />
            </section>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              画像をドロップまたは選択して変換を開始してください
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
