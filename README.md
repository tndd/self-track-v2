# Self-Track v2

Self-Track v2 は、モバイルファーストかつグラスモフィズム（すりガラス風）デザインを取り入れた、習慣および体調記録アプリケーションです。日々のログ（体調、カスタムアクション、症状）を記録でき、統計指標を用いて直接的および遅延的な相関関係パターンを動的に分析します。

---

## 🛠 技術スタック (Tech Stack)

- **フレームワーク**: Next.js 16+ (App Router), React 19, TypeScript
- **データベース ORM**: Drizzle ORM + PostgreSQL (`postgres` クライアント)
- **スタイリング**: Tailwind CSS (グラスモフィズム & モバイルファーストデザインシステム)
- **分析エンジン**: `simple-statistics` (ピアソン相関係数の計算に使用)
- **テスト**: Vitest (ユニットテストおよび統合テスト)

---

## 🚀 はじめに (Getting Started)

### 1. インストール
プロジェクトの依存関係をインストールします：
```bash
npm install
```

### 2. 環境変数の設定
`.env.example` を `.env.local` にコピーし、PostgreSQL の接続文字列を設定します：
```bash
cp .env.example .env.local
```
`.env.local` の内部：
```env
DATABASE_URL=postgresql://username:password@localhost:5432/self_track_v2
```

### 3. プロジェクトの起動
開発サーバーを起動します：
```bash
npm run dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認します。

### 4. テストの実行
Vitest テストスイート（分析ロジックの純粋なユニットテスト、およびデータベースをモックした API ルートテスト）を実行します：
```bash
npx vitest run
```

### 5. リアルなダミーデータの流し込み (Seed)
グラフの表示や相関分析のテストに最適な、JST（日本標準時）に合わせた高密度な30日分のリアルなデータセットをデータベースに投入します：
```bash
npm run db:seed
```

---

## 📂 プロジェクト構成 (Project Structure)

```
src/
├── app/
│   ├── api/                # RESTful API エンドポイント (CRUD & 分析)
│   │   ├── entries/        # GET (カーソルベース・ページネーション) & POST エントリー
│   │   ├── entries/[id]/   # GET / PUT / DELETE 単一エントリー
│   │   ├── actions/        # GET & POST アクション
│   │   ├── actions/[id]/   # PUT & DELETE アクション
│   │   ├── action-groups/  # GET & POST アショングループ
│   │   ├── symptoms/       # GET & POST 症状 (Symptom)
│   │   └── analysis/       # 分析用エンドポイント (ランキング, 組み合わせ, タイムラグ, 日次スコア)
│   ├── calendar/           # 月間グリッド表示ページ
│   ├── analysis/           # 統計チャート & ランキングページ
│   ├── manage/             # データ管理ダッシュボード (CRUD インターフェース)
│   ├── layout.tsx          # ボトムナビゲーションを含むグローバルレイアウト
│   └── page.tsx            # 本日のトレンドおよびタイムラインを含むホームページ
├── components/             # 再利用可能な UI コンポーネント (ConditionCurve, Timeline など)
├── db/                     # Drizzle スキーマ、DB クライアント、シードスクリプト
└── lib/
    └── analysis/           # コア数学分析エンジン & ローダー
```

---

## 📄 詳細仕様・ドキュメント

詳細な仕様、データベース構造の深掘り、数学的詳細については、`docs/` 内の各ファイルを参照してください：

*   **データベース仕様**: 詳細なスキーマフィールド、エンティティ関係、制約、およびカスケード削除の設定：
    ➔ [docs/database_schema.md](file:///Users/tau/repo/dev/self-track-v2/docs/database_schema.md)
*   **分析＆統計アルゴリズム**: 数式（ピアソン相関）、時間減衰スコアリング、パディング制約、および翌日ラグシフトの計算詳細：
    ➔ [docs/analysis_algorithms.md](file:///Users/tau/repo/dev/self-track-v2/docs/analysis_algorithms.md)
