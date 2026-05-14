# Engineer Result フォーマット

engineerサブエージェントが実装完了後に出力する報告テンプレート。

---

```md
Engineer Result

Goal:
<実装したタスクの1行要約>

変更ファイル（Changed Files）:
<git diff --stat の出力>

差分（Diff）:
<git diff の出力>

検証結果（Verification）:
<実行したコマンドとその結果。検証コマンドがなければ「なし」>

ステータス（Status）:
SUCCESS または NEEDS_FIX

備考（Notes）:
<実装上の判断・制約・注意点があれば記述する。なければ「なし」>
```
