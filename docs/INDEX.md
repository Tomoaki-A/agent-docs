# AgentドキュメントINDEX

## 読む順番
1. BASE.md
2. response.md
3. rules/*
4. projects/*
5. formats/*

## ドキュメント構成
- 基本方針: ./BASE.md
- 回答フォーマット: ./response.md
- コーディング規約: ./rules/coding.md
- 命名規約: ./rules/naming.md
- 構成規約: ./rules/structure.md
- スタイリング規約: ./rules/styling.md
- プロジェクト情報: ./projects/*
- 入出力フォーマット: ./formats/*

## 追加ルール
- 新しいドキュメントを追加する場合は、必ずこのINDEXを更新する
- INDEXに記載されていないドキュメントは参照禁止

## docs/projects/ の扱い

### init（初回セットアップ）
全ドキュメントを生成する。`docs/projects/overview.md` もこのタイミングで作成する。

### update（更新）
`docs/rules/*` や `docs/formats/*` などの共有ドキュメントを最新版に更新する。ただし `docs/projects/` 配下はプロジェクト固有の設定が含まれるため、既存ファイルが存在する場合は変更しない。
