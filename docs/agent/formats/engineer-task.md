# Engineer Task フォーマット

engineerサブエージェントへ渡す実装指示テンプレート。

---

```md
Engineer Task

Goal:
<このタスクで達成する内容を1〜3行で記述する>

Description:
<実装内容の詳細。何を・どのように実装するかを具体的に記述する>

Target Files:
<実際に変更するファイルの一覧>
- path/to/file

Acceptance Criteria:
<これを満たせば完了とみなす条件をチェックリスト形式で記述する>
- [ ] <条件1>
- [ ] <条件2>

Constraints:
<守るべき制約条件。コーディング規約・設計方針・禁止事項など>
- docs/agent/rules/ 配下の全規約に従うこと
- Scope 外のファイルを変更しないこと
- 不必要なリファクタリングをしないこと

Output Requirements:
docs/agent/formats/engineer-result.md のフォーマットで結果を報告すること
```
