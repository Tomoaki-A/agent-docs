# agent-docs

Claude Code を使ったプロジェクト開発のためのエージェント設定・規約ドキュメント一式です。  
インストールすることで、サブエージェント・スキル・コーディング規約・入出力フォーマットをプロジェクトに展開できます。

## インストール

### 1. `package.json` に追加

```json
{
  "dependencies": {
    "agent-docs": "github:Tomoaki-A/agent-docs#v1.0.0"
  }
}
```

### 2. インストールと展開

```bash
pnpm install
pnpm agent-docs-update
```

プロジェクトルートに以下が展開されます。

```
.claude/
  agents/       # サブエージェント定義
  skills/       # スキル定義
docs/
  rules/        # コーディング規約
  formats/      # 入出力フォーマット
CLAUDE.md       # Claude Code 基本設定（マージ）
```

### 3. バージョンの更新

`package.json` のタグを変更して再実行します。

```bash
# package.json のタグを更新した後
pnpm install
pnpm agent-docs-update
```

## 展開ルール

| ファイル | 初回 | 2回目以降 |
|---|---|---|
| `CLAUDE.md` | 新規作成 | マーカー内のみ上書き、プロジェクト独自追記を保持 |
| `docs/rules/projects.md` | 新規作成 | スキップ（プロジェクトが独自に編集するため） |
| その他すべて | コピー | 上書き |

### `CLAUDE.md` のマージ仕様

`CLAUDE.md` はマーカーで管理領域を分離します。

```md
<!-- agent-docs:start -->
（このパッケージが管理するセクション）
<!-- agent-docs:end -->

## プロジェクト固有の設定  ← ここはアップデートで消えない
```

### `docs/rules/projects.md` について

初回展開時に `# プロジェクト固有規約` という見出しのみのファイルが作成されます。  
以降はプロジェクトごとに自由に追記してください。アップデートで上書きされません。

## 同梱コンテンツ

### サブエージェント（`.claude/agents/`）

| エージェント | 役割 |
|---|---|
| `architect` | 実装前の設計を確定する設計専用エージェント。ファイル編集は行わない |
| `engineer` | Task Contract に基づいてコードを実装するエージェント |
| `reviewer` | 実装済みコードをレビューするエージェント。コード変更は行わない |
| `researcher` | コードベースの調査・説明・質問への回答を行うエージェント |

### スキル（`.claude/skills/`）

| スキル | 役割 |
|---|---|
| `/pm` | オーケストレーター。タスク受付から完了報告までを管理する |
| `/github` | GitHub の Issue / Pull Request を操作する |
| `/create-issue` | アイデアを対話で深掘りし、高品質な GitHub Issue を作成する |
| `/codex-exec` | Codex CLI を danger-full-access モードで実行する |

### コーディング規約（`docs/rules/`）

| ファイル | 内容 |
|---|---|
| `coding.md` | TypeScript・関数・型・非同期処理のコーディング規約 |
| `naming.md` | 変数・ファイル・コンポーネントの命名規約 |
| `structure.md` | ディレクトリ・ファイル構成規約 |
| `styling.md` | スタイリング規約 |
| `projects.md` | プロジェクト固有規約（各プロジェクトで追記） |

### 入出力フォーマット（`docs/formats/`）

サブエージェント間のタスク受け渡しに使う標準フォーマット群です。

| ファイル | 内容 |
|---|---|
| `architect-task.md` | architect への入力フォーマット |
| `task-contract.md` | architect の出力（設計契約） |
| `engineer-task.md` | engineer への入力フォーマット |
| `engineer-result.md` | engineer の出力フォーマット |
| `reviewer-task.md` | reviewer への入力フォーマット |
| `reviewer-result.md` | reviewer の出力フォーマット |
| `design-review-task.md` | デザインレビューへの入力フォーマット |
| `design-review-result.md` | デザインレビューの出力フォーマット |
| `research-task.md` | researcher への入力フォーマット |

## 開発

```bash
pnpm install
pnpm test      # テスト実行
pnpm build     # TypeScript コンパイル（bin/update.js を更新）
```

### リリース手順

1. `src/update.ts` を変更した場合は `pnpm build` を実行してコミット
2. CI（テスト・ビルド整合性チェック）が通ったことを確認
3. GitHub の Web UI でタグ（例: `v1.0.1`）を作成
