# Wonder Journey Prompt Storage

AIプロンプトを効率的に管理するためのWebアプリケーション

## 技術スタック

| 項目 | 技術 |
|------|------|
| バックエンド | Hono |
| フロントエンド | Vanilla JS + TailwindCSS |
| データベース | Supabase (PostgreSQL) |
| ホスティング | Vercel |

## 主な機能

- プロンプトのCRUD（作成・編集・削除・コピー）
- カテゴリー管理（アイコン・カラーカスタマイズ）
- キーワード・タグ検索
- ドラッグ&ドロップによる並び替え
- レスポンシブデザイン
- ダークモードUI

## プロジェクト構造

```
webapp/
├── api/
│   └── index.ts          # Vercel Serverless Functions (API)
├── public/
│   ├── index.html        # フロントエンドHTML
│   └── static/
│       ├── app.js        # フロントエンドJS
│       └── style.css     # スタイル
├── schema.sql            # PostgreSQLテーブル定義
├── vercel.json           # Vercel設定
└── package.json          # 依存関係
```

## API エンドポイント

### プロンプト管理
- `GET /api/prompts` - 全プロンプト取得（フィルタリング対応）
- `GET /api/prompts/:id` - 特定プロンプト取得
- `POST /api/prompts` - プロンプト作成
- `PUT /api/prompts/:id` - プロンプト更新
- `PUT /api/prompts/reorder` - プロンプト順序変更
- `DELETE /api/prompts/:id` - プロンプト削除

### カテゴリー管理
- `GET /api/categories` - 全カテゴリー取得
- `POST /api/categories` - カテゴリー作成
- `PUT /api/categories/:id` - カテゴリー更新
- `PUT /api/categories/reorder` - カテゴリー順序変更
- `DELETE /api/categories/:id` - カテゴリー削除

## デプロイ手順

### 1. Supabaseでデータベースを作成

1. [supabase.com](https://supabase.com) でプロジェクト作成
2. SQL Editorで `schema.sql` を実行
3. Settings → Database → Connection string (URI) をコピー

### 2. Vercelにデプロイ

1. [vercel.com](https://vercel.com) でGitHubリポジトリをインポート
2. Environment Variablesを設定:
   - `DATABASE_URL` = Supabaseの接続文字列
3. Deploy

## ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | Supabase PostgreSQL接続文字列 |

## 更新履歴

- 2024-11-26: Vercel + Supabaseに移行
- 2024-11-08: 初版作成（Cloudflare Pages + D1）
