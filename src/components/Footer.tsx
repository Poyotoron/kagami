export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            <p>
              <strong>🔒 プライバシー保護:</strong>{' '}
              すべての画像処理はお使いのブラウザ内で完結します。
            </p>
            <p>画像がサーバーに送信されることはありません。</p>
          </div>
          <div className="text-sm text-gray-400">
            <p>
              Kagami - 名前の由来:{' '}
              <span className="text-gray-500">
                八咫鏡（やたのかがみ）
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
