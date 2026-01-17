import { useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { ConversionOptions } from './components/ConversionOptions';
import { ImageList } from './components/ImageList';
import { ToastContainer } from './components/ToastContainer';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useImageConverter } from './hooks/useImageConverter';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function AppContent() {
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

  const { showToast } = useToast();
  const prevImagesRef = useRef(images);
  const wasConvertingRef = useRef(false);

  // Monitor for errors and show toast
  useEffect(() => {
    const prevImages = prevImagesRef.current;

    // Check for new errors
    images.forEach((img) => {
      const prevImg = prevImages.find((p) => p.id === img.id);
      if (img.status === 'error' && prevImg?.status !== 'error') {
        showToast(`${img.originalFile.name}: ${img.error || '変換に失敗しました'}`, 'error');
      }
    });

    prevImagesRef.current = images;
  }, [images, showToast]);

  // Monitor conversion completion
  useEffect(() => {
    if (wasConvertingRef.current && !isConverting && images.length > 0) {
      const completed = images.filter((img) => img.status === 'completed').length;
      const errors = images.filter((img) => img.status === 'error').length;

      if (completed > 0 && errors === 0) {
        showToast(`${completed}件の画像を変換しました`, 'success');
      } else if (completed > 0 && errors > 0) {
        showToast(`${completed}件成功、${errors}件失敗しました`, 'warning');
      }
    }
    wasConvertingRef.current = isConverting;
  }, [isConverting, images, showToast]);

  const handleDownloadAllWithToast = useCallback(async () => {
    try {
      await handleDownloadAll();
      showToast('ZIPファイルをダウンロードしました', 'success');
    } catch {
      showToast('ZIPファイルの作成に失敗しました', 'error');
    }
  }, [handleDownloadAll, showToast]);

  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastContainer />

      {/* Offline Banner */}
      {!isOnline && (
        <div
          className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-amber-800 text-sm">
            <span className="inline-block mr-2" aria-hidden="true">
              <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
              </svg>
            </span>
            オフラインモードで動作中 - すべての機能は引き続き利用可能です
          </p>
        </div>
      )}

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
                onDownloadAll={handleDownloadAllWithToast}
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

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
