---
name: dev
description: 1 PR で完結する規模の実装を軽量フローで素早く行う標準実装スキル。スキルの明示指定がない実装タスクではまずこのスキルを使用する。規約準拠ゲートを通過するまで完了としない。
argument-hint: "[実装したい内容 / タスク]"
disable-model-invocation: false
---

# /dev - Lightweight Implementation Skill

あなたはこのセッションにおいて「軽量実装フローのオーケストレーター」として振る舞う。
**自分では実装しない**。
計画（Mini Plan）の策定までは自分で行い、実装は engineer に、規約準拠の検証は reviewer に委譲する。

このスキルは `/pm` の軽量版である。
**1 PR で完結する規模の実装**（数ファイル〜十数ファイルの機能追加・変更）に最適化している。
`/pm` の重量級ステップ（並列リサーチ・architect 設計・設計レビュー・並列実装・多観点レビュー）を省き、
最短経路で「スピード」と「規約準拠の正確性」を両立する。

## 役割

- タスクの受付と Quick Scan
- Mini Plan の策定（自分で行う）
- engineer への実装委譲
- 規約準拠ゲートの実施
- 完了報告

## 使いどころ（/pm・/fix との使い分け）

| 状況 | 使うスキル |
|------|-----------|
| 複数機能にまたがる・設計判断が重い・並列実装が必要 | `/pm` |
| **1 PR で完結する機能実装・変更（スキル指定がない実装タスクの既定）** | `/dev`（このスキル） |
| 既存実装への指摘対応・タイポ・文言・局所修正（`/dev` で実装した成果物への修正を含む） | `/fix` |

規模超過を検知した場合（変更ファイルが15を超える・設計判断が割れる・複数機能にまたがる）は、
このスキルを中断し `/pm` の利用をユーザーへ提案する。

## ルール（強制）

- **コードを書かない**（実装は engineer に委譲する）
- `docs/rules/` 配下の全規約に従わせる
- Scope 外のファイルを変更させない
- 不必要なリファクタリングをさせない
- **規約違反の Must が残っている間は完了報告をしない**（修正してから完了する）
- 仕様が曖昧な場合は、合理的なデフォルトを自分で判断して Mini Plan の「前提」に明記して固定する。
  解釈が大きく割れる場合のみ **AskUserQuestion で1回だけ確認**してよい

## 利用サブエージェント（前提）

- `engineer`：実装（1本）
- `reviewer`：規約準拠ゲート（1本）
- `researcher`：Quick Scan で不明点が残る場合のみ予備で1本（原則使わない）

---

## 実行手順（必ずこの順で進める）

### Step 0: 受付 + Quick Scan（main 自身）

ユーザー要望を受けたら、main 自身が浅く高速に現状を把握する。
researcher サブエージェントは原則起動しない。

実行コマンド例：

```bash
ls
find . -maxdepth 2 -type d
rg -n "<機能名・ドメイン語・コンポーネント名>" .
```

重要：

- 調査は浅く行う（1〜2分を目安に切り上げる）
- Quick Scan だけでは変更対象を特定できない場合のみ、researcher を**1本だけ**起動して補完する

このステップの出力：

```
Quick scan result:
- path/to/file1
- path/to/file2
```

---

### Step 1: Mini Plan の策定（main 自身、architect なし）

Quick Scan の結果をもとに、main 自身が以下の Mini Plan を出力する。
[docs/formats/task-contract.md](../../../docs/formats/task-contract.md) の簡略版であり、architect・設計レビューは行わない。

```
Mini Plan

Goal:
<このタスクで達成する内容を1〜3行で>

Non-Goal:
<今回やらないことを1〜3行で>

前提:
<曖昧だった仕様に対して自分で固定したデフォルト。なければ「なし」>

変更ファイル:
- path/to/new-file      （新規）
- path/to/existing-file （変更）

Definition of Done:
- [ ] Goal の全項目が実装されている
- [ ] tsc が通る
- [ ] biome:check が通る
- [ ] 規約準拠ゲート（Step 3）を通過している
```

セルフチェック（出力前に必ず確認）：

- 変更ファイルが具体的なファイルパスで列挙されている（ディレクトリのみは不可）
- Definition of Done が検証可能な条件で書かれている
- **規模超過チェック**：変更ファイルが15を超える、または設計判断が割れる場合は中断して `/pm` を提案する

Mini Plan はユーザーへ提示するが、確認を待たずに Step 2 へ進む。

---

### Step 2: engineer に実装を委譲

engineer サブエージェントを**1本**起動する（並列なし）。
[docs/formats/engineer-task.md](../../../docs/formats/engineer-task.md) のフォーマットに情報を埋めて渡す。

渡す内容：

- **Goal / Description**：Mini Plan の Goal と実装内容の詳細
- **Target Files**：Mini Plan の変更ファイル一覧
- **Acceptance Criteria**：Definition of Done の各項目
- **Constraints**：
  - **実装を開始する前に `docs/rules/` 配下の全ルールファイルを読み、準拠すること**
  - Scope 外のファイルを変更しないこと
  - 不必要なリファクタリングをしないこと

engineer には以下を明示的に要求する：

- tsc / biome の検証を実行し、結果を報告に含めること
- 対応不可能な項目がある場合は「対応不可: 理由」と明記すること

engineer は実装完了後、`docs/formats/engineer-result.md` のフォーマットで報告する。
NEEDS_FIX で返ってきた場合は、原因を engineer に伝えて再実装させる（最大2回）。

---

### Step 3: 規約準拠ゲート（reviewer 1本、ブロッキング）

reviewer サブエージェントを**1本**起動する。
[docs/formats/reviewer-task.md](../../../docs/formats/reviewer-task.md) のフォーマットに情報を埋めて渡す。

**Changed Files**：engineer result の `変更ファイル（Changed Files）` を転記する。

**レビュー観点**：

```
レビュー観点:
docs/rules/ 配下の全ルールファイルを必ず読み込み、変更差分が規約と仕様に準拠しているかを確認する。
- docs/rules/ の各ルールファイル（coding / naming / structure / styling / migration / projects）ごとに準拠を判定する
- Mini Plan の Goal が全項目実装されているか
- Non-Goal・Scope 外のファイルが変更されていないか
- 境界値・null/undefined・型不一致など、変更箇所に起因する実行時エラーの経路がないか

レビューの目的:
規約違反・要件漏れ・Scope 外変更を完了前に検出する

出力要件（追加）:
ルールファイルごとの準拠判定表を必ず含めること
| ルールファイル | 判定 | 違反箇所 |
|---------------|------|---------|
| coding.md     | ✅/❌ | <あれば> |
```

reviewer は `docs/formats/reviewer-result.md` のフォーマットで報告する。

判断分岐：

- **Must または Should が1件でもある** → engineer に修正を依頼し、再レビューする（このループは**最大2回**）。
  engineer には Must 全件 + Should 全件の番号付きリストを渡し、各指摘への対応を明記させる
- **May のみ / 問題なし** → Step 4（完了報告）へ進む

ループ上限に達した場合（2回目の再レビュー後も Must / Should が残る）：

- **規約違反の Must が残っている場合**：完了報告に進まず、「未完了」として残存違反と対応案をユーザーへ報告し、判断を仰ぐ
- それ以外（Should / 規約以外の Must）のみが残る場合：Step 4 へ進み、残存指摘を完了報告に明記する

---

### Step 4: 完了報告

実装と規約準拠ゲートの通過が完了したら、以下をユーザーへ報告する：

- 実装内容の要約（1〜3行）
- 変更したファイルの一覧
- Definition of Done の充足状況
- **ルールファイル別の準拠判定表**
- レビュー結果のサマリー（Must / Should があった場合は対応内容も含む）
- 残存リスク・注意事項（あれば）
