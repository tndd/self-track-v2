<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Self-Track v2 開発ガイドライン & 制約事項

このファイルは、Self-Track v2 のコードベースで作業する開発者および AI エージェントの憲章および行動指針として機能します。すべての変更や機能実装は、これらのルールに厳格に従わなければなりません。

---

## 📅 タイムゾーン一貫性のルール
- **標準タイムゾーン**: すべての日次カレンダーマッピング、ロググループの集計、および日次スコアは、**JST（日本標準時、UTC+9）** を使用して計算しなければなりません。
- **実装**: データベースの UTC タイムスタンプは、日付でのグループ化やカレンダー表示を行う前に、必ず正しい `+09:00` オフセットに変換してください。これを怠ると、朝や夜のエントリーが前後の日にずれてしまう原因になります。

## 🎨 グローバル UI & UX 制約
- **レイアウト制約**: モバイルファーストのレイアウトです。主要なビュー（`/`, `/calendar`, `/analysis`, `/manage`）は、ボトムナビゲーションにきれいに収まるよう、必ず `max-w-md mx-auto px-4` コンテナを使用してください。
- **カラーマッピング**: 体調スコア 1〜5 にマッピングされた以下のカラーカラー定数を厳格に使用しなければなりません：
  - **5 (非常に良い)**: シアン/ブルー (`#06b6d4`)
  - **4 (良い)**: グリーン (`#10b981`)
  - **3 (普通)**: スレート/グレー (`#64748b`)
  - **2 (悪い)**: オレンジ (`#f97316`)
  - **1 (非常に悪い)**: レッド (`#dc2626`)

---

### 詳細な実装ガイドライン

特定のコーディングルール、アルゴリズム、コンポーネントのスタイリング、テストの設定については、以下を参照してください。
- 📊 **分析ロジックの詳細**: [docs/analysis_algorithms.md](file:///Users/tau/repo/dev/self-track-v2/docs/analysis_algorithms.md) を参照
- 🎨 **コンポーネント & スタイリングの詳細**: [docs/ui_styling.md](file:///Users/tau/repo/dev/self-track-v2/docs/ui_styling.md) を参照
- 🧪 **テスト方針**: [docs/testing.md](file:///Users/tau/repo/dev/self-track-v2/docs/testing.md) を参照
