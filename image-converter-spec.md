# Kagami（カガミ） - 画像変換ツール 要件定義書

## 1. プロジェクト概要

### 1.1 ツール名

**Kagami（カガミ）**

#### 名前の由来
日本神話に登場する **石凝姥命（イシコリドメノミコト）** が作った **八咫鏡（やたのかがみ）** に由来する。

| ツールの特徴 | 鏡・石凝姥命との関連 |
|-------------|---------------------|
| 画像（映像）を扱う | 鏡＝映像を映すもの |
| 形式を変換する | 鏡を鋳造し形を作る |
| 品質を調整する | 鏡を磨き上げる |
| クライアントで完結 | 神聖な鏡は外に出さない（プライバシー保護） |

#### リポジトリ名
`kagami` または `kagami-image-converter`

### 1.3 目的
ブラウザ上で動作するクライアントサイド画像変換ツールを開発する。GitHub Pagesでホスティング可能な静的サイトとして実装する。

### 1.4 ターゲットユーザー
- 簡単に画像フォーマットを変換したい一般ユーザー
- プライバシーを重視し、画像をサーバーにアップロードしたくないユーザー

### 1.5 主要な価値提案
- **完全クライアントサイド処理**: 画像データがサーバーに送信されない
- **無料・広告なし**: GitHub Pagesでホスティング
- **インストール不要**: ブラウザのみで動作

---

## 2. 技術スタック

### 2.1 フロントエンド
- **フレームワーク**: React 18+ (Vite使用)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **画像処理**: Canvas API + browser-image-compression

### 2.2 ビルド・デプロイ
- **ビルドツール**: Vite
- **ホスティング**: GitHub Pages
- **CI/CD**: GitHub Actions

### 2.3 対応ブラウザ
- Chrome (最新2バージョン)
- Firefox (最新2バージョン)
- Safari (最新2バージョン)
- Edge (最新2バージョン)

---

## 3. 機能要件

### 3.1 画像入力機能

| 機能ID | 機能名 | 説明 | 優先度 |
|--------|--------|------|--------|
| F-001 | ファイル選択 | ファイルダイアログから画像を選択 | 必須 |
| F-002 | ドラッグ&ドロップ | 画像をドロップゾーンにD&Dで追加 | 必須 |
| F-003 | クリップボード貼り付け | Ctrl+Vで画像を貼り付け | 任意 |
| F-004 | 複数ファイル選択 | 一度に複数画像を選択可能 | 必須 |

### 3.2 対応フォーマット

#### 入力フォーマット
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif) ※静止画として処理
- BMP (.bmp)
- SVG (.svg) ※ラスタライズして処理

#### 出力フォーマット
- JPEG (.jpg)
- PNG (.png)
- WebP (.webp)

### 3.3 変換オプション

| 機能ID | 機能名 | 説明 | 優先度 |
|--------|--------|------|--------|
| F-101 | フォーマット変換 | 出力形式の選択 | 必須 |
| F-102 | 品質調整 | JPEG/WebPの品質(1-100) | 必須 |
| F-103 | リサイズ | 幅・高さ指定またはパーセント指定 | 必須 |
| F-104 | アスペクト比維持 | リサイズ時に縦横比を維持 | 必須 |
| F-105 | 最大ファイルサイズ指定 | 指定サイズ以下に自動圧縮 | 任意 |

### 3.4 出力機能

| 機能ID | 機能名 | 説明 | 優先度 |
|--------|--------|------|--------|
| F-201 | 個別ダウンロード | 各画像を個別にダウンロード | 必須 |
| F-202 | 一括ダウンロード | ZIPファイルでまとめてダウンロード | 必須 |
| F-203 | プレビュー表示 | 変換前後の画像を並べて表示 | 必須 |
| F-204 | ファイルサイズ表示 | 変換前後のサイズを表示 | 必須 |

---

## 4. 非機能要件

### 4.1 パフォーマンス
- 10MB以下の画像は5秒以内に変換完了
- 同時に最大20ファイルまで処理可能
- Web Workerを使用してUIブロッキングを防止

### 4.2 セキュリティ
- すべての処理はクライアントサイドで完結
- 外部サーバーへの画像データ送信なし
- Content Security Policy (CSP) を適切に設定

### 4.3 アクセシビリティ
- WCAG 2.1 Level AA準拠
- キーボード操作対応
- スクリーンリーダー対応

### 4.4 レスポンシブデザイン
- モバイル (320px〜)
- タブレット (768px〜)
- デスクトップ (1024px〜)

---

## 5. UI/UX設計

### 5.1 画面構成

```
┌─────────────────────────────────────────────────────────┐
│  ヘッダー: ロゴ + タイトル + GitHub リンク              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         ドロップゾーン                          │   │
│  │    (クリックまたはD&Dで画像を追加)              │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │  変換オプション  │  │  画像リスト                │  │
│  │  ・出力形式      │  │  ┌────┐ ファイル1.jpg     │  │
│  │  ・品質          │  │  │    │ 2.5MB → 800KB     │  │
│  │  ・リサイズ      │  │  └────┘ [削除] [DL]       │  │
│  │                  │  │  ┌────┐ ファイル2.png     │  │
│  │  [すべて変換]    │  │  │    │ 1.2MB → 400KB     │  │
│  │  [一括DL]        │  │  └────┘ [削除] [DL]       │  │
│  └──────────────────┘  └────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  フッター: プライバシーポリシー + 使い方               │
└─────────────────────────────────────────────────────────┘
```

### 5.2 インタラクション

1. **ドラッグ&ドロップ時**
   - ドロップゾーンがハイライト表示
   - ドロップ後に即座にサムネイル表示

2. **変換処理中**
   - プログレスバー表示
   - 処理中の画像にスピナー表示

3. **エラー時**
   - トースト通知でエラーメッセージ表示
   - エラーの画像は赤枠でハイライト

---

## 6. ファイル構成

```
kagami/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages デプロイ用
├── public/
│   ├── favicon.ico
│   └── og-image.png            # OGP画像
├── src/
│   ├── components/
│   │   ├── DropZone.tsx        # D&Dエリア
│   │   ├── ImageList.tsx       # 画像一覧
│   │   ├── ImageItem.tsx       # 個別画像カード
│   │   ├── ConversionOptions.tsx # 変換設定パネル
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── hooks/
│   │   ├── useImageConverter.ts # 変換ロジック
│   │   └── useDropzone.ts       # D&D処理
│   ├── utils/
│   │   ├── imageProcessor.ts    # 画像処理ユーティリティ
│   │   ├── fileUtils.ts         # ファイル操作
│   │   └── zipUtils.ts          # ZIP生成
│   ├── workers/
│   │   └── imageWorker.ts       # Web Worker
│   ├── types/
│   │   └── index.ts             # 型定義
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                # Tailwind設定
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 7. 型定義

```typescript
// src/types/index.ts

export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface ConversionOptions {
  format: ImageFormat;
  quality: number;           // 1-100
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
```

---

## 8. 主要コンポーネントの仕様

### 8.1 DropZone
- ドラッグオーバー時に視覚的フィードバック
- クリックでファイル選択ダイアログを開く
- 対応していないファイル形式はエラー表示
- `accept` 属性で入力形式を制限

### 8.2 ConversionOptions
- デフォルト値: format=webp, quality=80, resize=null
- 品質スライダーはJPEG/WebP選択時のみ表示
- リサイズ入力はトグルで表示/非表示

### 8.3 ImageItem
- サムネイルは最大200x200pxで表示
- 変換前後のサイズを比較表示 (例: "2.5MB → 800KB (-68%)")
- 処理中はプログレスインジケータを表示

---

## 9. GitHub Actions ワークフロー

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          BASE_URL: /${{ github.event.repository.name }}/
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 10. 実装優先順位

### Phase 1: MVP (必須機能)
1. 基本UI構築 (DropZone, ImageList, Options)
2. 単一画像の変換機能
3. フォーマット変換 (JPEG/PNG/WebP)
4. 品質調整
5. 個別ダウンロード

### Phase 2: 拡張機能
1. 複数ファイル対応
2. 一括ダウンロード (ZIP)
3. リサイズ機能
4. Web Worker対応

### Phase 3: 最適化
1. プログレス表示
2. エラーハンドリング強化
3. アクセシビリティ対応
4. PWA対応

---

## 11. 開発コマンド

```bash
# プロジェクト作成
npm create vite@latest kagami -- --template react-ts

# 依存関係インストール
npm install
npm install -D tailwindcss postcss autoprefixer
npm install browser-image-compression jszip file-saver
npm install -D @types/file-saver

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

---

## 12. 注意事項

1. **GitHub Pagesの制約**
   - 静的ファイルのみ (サーバーサイド処理不可)
   - リポジトリ名がサブパスになる (base URL設定必要)

2. **ブラウザAPI制限**
   - 大きなファイルはメモリ不足の可能性
   - Safari では一部 Canvas API の挙動が異なる

3. **ライセンス**
   - MIT License を採用
   - 使用ライブラリのライセンス確認必須

---

## 13. README テンプレート

```markdown
# 🪞 Kagami - 画像変換ツール

> 鏡のように画像を映し、新しい形に変換する

[![Deploy to GitHub Pages](https://github.com/USERNAME/kagami/actions/workflows/deploy.yml/badge.svg)](https://github.com/USERNAME/kagami/actions/workflows/deploy.yml)

## ✨ 特徴

- **🔒 プライバシー重視** - すべての処理はブラウザ内で完結。画像がサーバーに送信されることはありません
- **⚡ 高速変換** - Web Worker による非同期処理で快適な操作性
- **📱 レスポンシブ** - PC・タブレット・スマートフォンに対応
- **🆓 完全無料** - 広告なし、登録不要

## 🎯 対応フォーマット

| 入力 | 出力 |
|------|------|
| JPEG, PNG, WebP, GIF, BMP, SVG | JPEG, PNG, WebP |

## 🚀 使い方

1. [Kagami](https://USERNAME.github.io/kagami) にアクセス
2. 画像をドラッグ&ドロップ、または「ファイルを選択」
3. 変換オプション（形式・品質・サイズ）を設定
4. 「変換」ボタンをクリック
5. 変換された画像をダウンロード

## 🛠️ 開発

\`\`\`bash
# インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
\`\`\`

## 📜 名前の由来

**Kagami（鏡）** - 日本神話で石凝姥命が作った八咫鏡に由来。画像を映し、新しい形に変換するツールの象徴として。

## 📄 ライセンス

MIT License
```

---

## 14. Claude Code 向け指示例

```bash
# Phase 1: MVP実装
claude "kagami-spec.md を読んで、Phase 1のMVPを実装してください。
まずプロジェクトの初期セットアップを行い、基本UIを構築してください。"

# Phase 2: 拡張機能
claude "kagami プロジェクトにPhase 2の機能（複数ファイル対応、ZIP一括ダウンロード、
リサイズ機能、Web Worker対応）を追加してください。"

# Phase 3: 最適化
claude "kagami プロジェクトのPhase 3（プログレス表示、エラーハンドリング強化、
アクセシビリティ対応、PWA対応）を実装してください。"

# デプロイ設定
claude "kagami プロジェクトにGitHub Pages用のデプロイ設定（GitHub Actions）を追加してください。"
```
