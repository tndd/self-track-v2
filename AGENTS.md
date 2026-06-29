<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Self-Track v2 AIエージェント行動規範

このファイルは、AIエージェントが本リポジトリで作業する際の行動指針とメタ制約を定義します。

このファイルのルールはグローバルに適用されるものであるため、常に`docs/`側に分離できないかを念頭に置いた上で必要ならばルールを記載するようにしてください。

## 🛠️ 行動・Git運用ルール
- **コミットの粒度**: 1つのファイル編集、または1つの明確なタスク（例：API実装、テスト作成）ごとに、小さく論理的にコミットを分けて提案してください。
- **依存関係の追加**: 新たな npm パッケージを追加する場合は、必ず事前にユーザーへ確認してください。
- **検証の徹底**: 変更を加えた後は、必ず関連するテスト（`npm run test` 等）を実行し、成功を確認してから作業を完了してください。
- **絶対パスの禁止**: ドキュメント、設定ファイル、ソースコードにおいて、ホストマシン固有の絶対パス（特に `file:///Users/` 等のローカルユーザー名が含まれるパス）の使用は禁止。本プロジェクトをルートとする相対パスを使用してください。


## ⚠️ 開発時の最重要注意セクション（AIバグ防止）
本プロジェクトでは、以下の2点においてAIが誤った実装を行いやすいため、実装時は必ず対応するドキュメントを**最優先で読み込んで**従うこと。

1. **タイムゾーンの処理**:
   - データベースはUTC保存ですが、アプリケーションは **JST (UTC+9)** を前提とします。日付の集計やカレンダー表示を行うコードを書く前に、必ず [docs/specs/analysis_algorithms.md](docs/specs/analysis_algorithms.md) の日付処理仕様を確認してください。
2. **UI & UX の一貫性**:
   - 本アプリはモバイル専用UIです。コンポーネント作成時は、必ず [docs/guidelines/ui_styling.md](docs/guidelines/ui_styling.md) のレイアウト制約とカラーパレットの指定を確認してください。

---

### 詳細仕様・個別ガイドラインの参照先

実装やテストを行う際は、必ず以下のドキュメントを参照してください。

* 📊 **設計・アルゴリズム仕様**: `docs/specs/` 配下
  - [データベース仕様](docs/specs/database_schema.md)
  - [分析アルゴリズム](docs/specs/analysis_algorithms.md)
* 🎨 **実装・開発ガイドライン**: `docs/guidelines/` 配下
  - [UIデザインルール](docs/guidelines/ui_styling.md)
  - [テスト方針](docs/guidelines/testing.md)
