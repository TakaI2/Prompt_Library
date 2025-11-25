# Wonder Journey Prompt Storage

## プロジェクト概要

**Wonder Journey Prompt Storage**は、AIプロンプトを効率的に管理するための高機能なWebアプリケーションです。プロンプトを一元管理し、カテゴリー、タグ、キーワードで簡単に検索・整理できます。さらに、Cloudflare Workers AIを活用した自動生成・改善機能により、より効果的なプロンプトを作成できます。

### 主な機能

- ✨ **プロンプト管理**: 作成、編集、削除、コピー機能
- 🔍 **高度な検索**: カテゴリー、キーワード、タグによるフィルタリング
- 🤖 **AI自動生成**: Cloudflare Workers AIによるプロンプトの自動生成（本番環境）
- 🔧 **AI改善機能**: 既存プロンプトをAIが分析して改善（本番環境）
- 🏷️ **タグ管理**: 複数タグによる柔軟な分類
- 📁 **カテゴリー管理**: カテゴリーの追加・編集・削除、カスタマイズ可能
- 🎨 **カテゴリーカスタマイズ**: 24種類のアイコンとカラーを自由に設定
- 🔄 **ドラッグ&ドロップ**: カテゴリーとプロンプトの直感的な並び替え
- 👁️ **プロンプト詳細モーダル**: カードクリックで詳細表示（ライトボックス）
- 🖼️ **画像URL対応**: プロンプトに画像URLを関連付け
- 🌙 **ダークモードUI**: 目に優しい洗練されたデザイン
- 🎯 **Wonder Journeyブランディング**: カスタムロゴとファビコン

## 現在完成している機能

✅ プロンプトの作成・編集・削除
✅ カテゴリーの作成・編集・削除
✅ カテゴリーのアイコン・カラーカスタマイズ（24種類のFont Awesomeアイコンから選択）
✅ カテゴリー名変更の自動カスケード（関連プロンプトも自動更新）
✅ カテゴリー別表示とフィルタリング
✅ キーワード検索機能
✅ タグ検索機能
✅ プロンプトのクリップボードコピー
✅ Cloudflare Workers AIによるプロンプト自動生成（本番環境のみ）
✅ Cloudflare Workers AIによるプロンプト改善（本番環境のみ）
✅ 画像URL対応
✅ レスポンシブデザイン
✅ Cloudflare D1データベース統合
✅ ドラッグ&ドロップによるカテゴリー並び替え（SortableJS）
✅ ドラッグ&ドロップによるプロンプト並び替え（SortableJS）
✅ プロンプト詳細モーダル（ライトボックス）
✅ Wonder Journeyブランドロゴとファビコン（透明背景）
✅ モダンなグラデーション検索UI
✅ コンパクトヘッダーデザイン

## 機能エントリポイント（API）

### プロンプト管理
- `GET /api/prompts` - 全プロンプト取得（フィルタリング対応）
  - クエリパラメータ: `category`, `keyword`, `tag`
- `GET /api/prompts/:id` - 特定プロンプト取得
- `POST /api/prompts` - プロンプト作成
- `PUT /api/prompts/:id` - プロンプト更新
- `PUT /api/prompts/reorder` - プロンプト順序変更（ドラッグ&ドロップ用）
  - リクエストボディ: `{ "promptIds": [3, 1, 2, 4] }`
- `DELETE /api/prompts/:id` - プロンプト削除

### カテゴリー管理
- `GET /api/categories` - 全カテゴリー一覧取得
- `POST /api/categories` - カテゴリー作成
  - リクエストボディ: `{ "name": "カテゴリー名", "icon": "folder", "color": "#4CD1E0" }`
- `PUT /api/categories/:id` - カテゴリー更新（自動カスケード対応）
  - カテゴリー名変更時、関連するすべてのプロンプトも自動更新
- `PUT /api/categories/reorder` - カテゴリー順序変更（ドラッグ&ドロップ用）
  - リクエストボディ: `{ "categoryIds": [2, 1, 3] }`
- `DELETE /api/categories/:id` - カテゴリー削除

### AI機能（本番環境のみ）
- `POST /api/ai/generate` - プロンプト自動生成
  - リクエストボディ: `{ "purpose": "目的", "target": "対象", "tone": "トーン", "format": "形式", "requirements": "追加要件" }`
  - 注意: ローカル開発環境では利用不可
- `POST /api/ai/improve` - プロンプト改善
  - リクエストボディ: `{ "prompt": "元のプロンプト" }`
  - 注意: ローカル開発環境では利用不可

## 未実装の機能

現時点で全ての主要機能が実装されています。今後の拡張候補：

- [ ] お気に入り機能
- [ ] 並び替えオプション（更新日、タイトル、人気度など）
- [ ] エクスポート/インポート機能（JSON形式）
- [ ] プロンプト使用履歴
- [ ] 複数ユーザー対応（認証機能）
- [ ] プロンプトテンプレート機能
- [ ] プロンプトバージョン管理（履歴追跡）
- [ ] コラボレーション機能（共有・コメント）

## 推奨される次のステップ

1. **本番環境へのデプロイ**
   - Cloudflare Pagesへのデプロイ準備完了
   - D1データベースを本番用に作成
   - AI機能は本番環境で自動的に有効化されます（Cloudflare Workers AI使用）

2. **カテゴリーのカスタマイズ**
   - サイドバーの「+」ボタンから新しいカテゴリーを追加
   - カテゴリーのホバー時に表示される編集・削除ボタンで管理
   - アイコンとカラーを自由に設定してプロジェクトに合わせてカスタマイズ

3. **機能拡張**
   - お気に入り機能の追加
   - エクスポート/インポート機能
   - プロンプトテンプレート

## URLs

### 開発環境
- **サンドボックスURL**: https://3000-iof60smoltadt2wesh7xq-0e616f0a.sandbox.novita.ai

### 本番環境
- **本番URL**: デプロイ後に利用可能

## データアーキテクチャ

### データモデル

**Prompts テーブル**
```sql
- id: INTEGER (Primary Key, Auto Increment)
- title: TEXT (プロンプトのタイトル)
- prompt: TEXT (プロンプトの内容)
- category: TEXT (カテゴリー名)
- tags: TEXT (JSON配列、文字列として保存)
- image_url: TEXT (画像URL、任意)
- user_id: TEXT (ユーザーID、デフォルト: 'default')
- created_at: DATETIME (作成日時)
- updated_at: DATETIME (更新日時)
```

**Categories テーブル**
```sql
- id: INTEGER (Primary Key, Auto Increment)
- name: TEXT UNIQUE (カテゴリー名)
- color: TEXT (カラーコード、デフォルト: '#4CD1E0')
- icon: TEXT (Font Awesomeアイコン名、デフォルト: 'folder')
- created_at: DATETIME (作成日時)
- updated_at: DATETIME (更新日時)
```

### ストレージサービス
- **Cloudflare D1**: SQLiteベースの分散データベース（プロンプト管理）
- **ローカル開発**: `.wrangler/state/v3/d1`にローカルSQLiteデータベース

### データフロー
1. フロントエンド（JavaScript）→ Hono API → Cloudflare D1
2. AI機能: フロントエンド → Hono API → Gemini API → レスポンス

## ユーザーガイド

### プロンプトの作成
1. 「新規プロンプト」ボタンをクリック
2. タイトル、プロンプト内容、カテゴリーを入力（必須）
3. タグを追加（Enterキーで確定）
4. 必要に応じて画像URLを入力
5. 「保存」ボタンをクリック

### AI自動生成を使う
1. 「新規プロンプト」モーダルを開く
2. 「AIでプロンプトを自動作成」セクションに説明を入力
3. 「生成」ボタンをクリック
4. 生成されたプロンプトを確認・編集して保存

### プロンプトの改善
1. プロンプトカードの「改変する」ボタンをクリック
2. AIが自動的にプロンプトを分析・改善
3. 改善版を確認して保存

### 検索とフィルタリング
- **カテゴリー**: 左サイドバーからカテゴリーを選択
- **キーワード検索**: 上部の検索バーにキーワードを入力
- **タグ検索**: タグ検索バーにタグ名を入力

### プロンプトのコピー
- プロンプトカードの「コピー」ボタンをクリック
- クリップボードにプロンプト内容がコピーされます

## デプロイ

### プラットフォーム
- **Cloudflare Pages** - エッジコンピューティングプラットフォーム

### ステータス
- ✅ ローカル開発環境：稼働中
- ⏳ 本番環境：未デプロイ（準備完了）

### 技術スタック
- **バックエンド**: Hono (v4.10.4)
- **フロントエンド**: Vanilla JavaScript + TailwindCSS
- **データベース**: Cloudflare D1 (SQLite)
- **AI**: Cloudflare Workers AI (Llama 3.1 8B Instruct)
- **デプロイ**: Cloudflare Pages
- **ビルドツール**: Vite

### AI機能について
- **ローカル開発**: AI機能は利用不可（手動でプロンプトを入力・編集）
- **本番環境**: Cloudflare Workers AIが自動的に有効化され、AI生成・改善機能が利用可能
- **外部APIキー不要**: Cloudflare Workers AIを使用するため、追加のAPIキー設定は不要

### デプロイ手順

1. **Cloudflare APIキーの設定**
   ```bash
   # setup_cloudflare_api_key ツールを使用
   ```

2. **D1データベースの作成**
   ```bash
   npx wrangler d1 create webapp-production
   # 出力されたdatabase_idをwrangler.jsoncに設定
   ```

3. **マイグレーション適用**
   ```bash
   npm run db:migrate:prod
   ```

4. **wrangler.jsoncのAIバインディングを有効化**
   ```bash
   # wrangler.jsoncのコメントアウトを解除
   # "ai": {
   #   "binding": "AI"
   # }
   ```

5. **Cloudflare Pagesプロジェクト作成**
   ```bash
   npx wrangler pages project create webapp --production-branch main
   ```

6. **デプロイ**
   ```bash
   npm run deploy:prod
   ```

**注意**: 本番環境ではCloudflare Workers AIが自動的に有効化されるため、追加のAPIキー設定は不要です。

## ローカル開発

### 前提条件
- Node.js 18+
- npm または yarn

### セットアップ
```bash
# 依存関係のインストール
npm install

# D1ローカルデータベースの初期化
npm run db:migrate:local

# シードデータの投入
npm run db:seed

# ビルド
npm run build

# 開発サーバー起動
pm2 start ecosystem.config.cjs

# または
npm run dev:sandbox
```

### 便利なコマンド
```bash
# ポート3000をクリーンアップ
npm run clean-port

# ローカルD1データベースコンソール
npm run db:console:local

# データベースリセット
npm run db:reset

# PM2ログ確認
pm2 logs webapp --nostream

# PM2ステータス確認
pm2 list
```

## 環境変数

ローカル開発・本番環境ともに、追加の環境変数設定は不要です。
- Cloudflare Workers AIは本番環境で自動的に有効化されます
- ローカル開発ではAI機能は無効化されており、手動でプロンプトを作成します

## 最終更新日
2025-11-08

---

## ユーザーガイドの追加情報

### カテゴリー管理
1. **カテゴリーの追加**
   - 左サイドバーの「カテゴリー」見出しの横にある「+」ボタンをクリック
   - カテゴリー名、アイコン、カラーを設定
   - 保存ボタンをクリック

2. **カテゴリーの編集**
   - カテゴリーにマウスをホバーすると編集・削除ボタンが表示
   - 鉛筆アイコンをクリックして編集モーダルを開く
   - 変更後、保存ボタンをクリック

3. **カテゴリーの削除**
   - カテゴリーにマウスをホバーしてゴミ箱アイコンをクリック
   - 確認ダイアログで「OK」をクリック

### AI機能（本番環境のみ）
- **ローカル開発**: AI生成・改善ボタンをクリックすると、機能が利用できない旨のメッセージが表示されます
- **本番環境**: Cloudflare Workers AIにより、AI生成・改善機能がフルに利用可能になります

---

**開発者向けノート**: このアプリケーションは、動画で説明されていたプロンプト管理システムと同じ機能を持つように設計されています。ダークモードUI、3カラムレイアウト、AI機能、そしてカテゴリー管理機能を完全に実装しています。外部APIキーは不要で、Cloudflare Workers AIを使用することで、シンプルかつ強力なAI機能を提供します。
