# Reviewer Task フォーマット

reviewerサブエージェントへ渡すレビュー指示テンプレート。

---

```md
Reviewer Task

## Changed Files
<engineerのgit diff --statから収集した変更ファイル一覧をPMが記述する>
- path/to/file1
- path/to/file2

## レビューターゲット
上記 Changed Files に列挙されたファイルのみを対象とする

## レビュー観点
<このレビューで重点的に確認する観点を記述する>

## レビューの目的
<このレビューで達成したい目的を記載する>

## Context

### Task Contract
architectが確定したTask Contractから関連部分を抜粋する

- Goal: <Task Contractで定義したこのタスクで達成する目的>
- 非対象（Non-Goal）: <Task Contractで定義したこのタスクでは実施しない内容>

## Output Requirements:
docs/agent/formats/reviewer-result.md のフォーマットで結果を出力すること
```
