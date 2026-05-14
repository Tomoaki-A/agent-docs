# Design Review Task フォーマット

reviewerサブエージェントへ渡す設計レビュー指示テンプレート。

---

```md
Design Review Task

## レビュー対象
Task Contract（architect が出力した設計契約）

## Task Contract
<architect が出力した Task Contract 全文をここに貼る>

## レビュー観点
<このレビューで重点的に確認する観点を記述する>

## レビューの目的
<このレビューで達成したい目的を記載する>

## Context

### User Request
<ユーザーの要求（原文）>

### Research Results
- researcher #1（Entry Points）の結果サマリー
- researcher #2（Similar Implementations）の結果サマリー
- researcher #3（Impact & Risks）の結果サマリー

## Output Requirements:
docs/agent/formats/design-review-result.md のフォーマットで結果を出力すること
```
