# Architect Task フォーマット

architectサブエージェントへ渡す入力テンプレート。

---

```md
Architect Task

User Request:
<ユーザーの要求をそのまま（原文）記述する>

Goal:
<今回のタスクの1行要約>

Context:
- Step 0 の Quick Scan 結果
- researcher #1（Entry Points）の結果
- researcher #2（Similar Implementations）の結果
- researcher #3（Impact & Risks）の結果

Constraints:
- docs/agent/rules/ 配下の全規約に従うこと
- 既存実装パターンを優先して流用する
- 不必要なリファクタリングは禁止
- Scope を最小化する

Output Requirements:
docs/agent/formats/task-contract.md のフォーマットで Task Contract を完全な形で出力すること
```
