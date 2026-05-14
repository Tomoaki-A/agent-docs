---
name: github
description: GitHub の Issue / Pull Request を REST API 経由で操作する（一覧取得・作成）。
argument-hint: "<サブコマンド> [オプション] (例: issues list, issues create \"タイトル\", pr list, pr create \"タイトル\")"
---

# /github - GitHub Issue / PR 管理スキル

GitHub REST API を curl で呼び出し、Issue と Pull Request の操作を行う。

## 前提条件の確認（最初に必ず実行）

以下の1コマンドで REMOTE・TOKEN・REPO・BRANCH を一括取得する。

```bash
printf "REMOTE:%s\nTOKEN:%s\nREPO:%s\nBRANCH:%s\n" \
  "${CLAUDE_CODE_REMOTE:+OK}" \
  "${GH_TOKEN:+OK}" \
  "$(git remote get-url origin 2>/dev/null | sed -E 's#.*/([^/]+)/([^/.]+)(\.git)?$#\1/\2#')" \
  "$(git branch --show-current 2>/dev/null)"
```

出力を確認し、以下の条件に従って処理を中断する：
- `REMOTE:` の値が空の場合：
  > このスキルは Claude Code Web（リモート環境）からのみ実行可能です。ローカル環境では `gh` CLI を直接ご利用ください。
- `TOKEN:` の値が空の場合：
  > `GH_TOKEN` 環境変数が設定されていません。GitHub Personal Access Token を設定してください。
- `REPO:` の値が空または `origin` のみの場合：ユーザーに `owner/repo` の指定を求める。

以降のコマンドでは、取得した REPO の値を `{OWNER/REPO}`、BRANCH の値を `{CURRENT_BRANCH}` として使用する。

---

## サブコマンド一覧

ユーザーの `$ARGUMENTS` を解釈し、以下のいずれかの操作を実行する。

---

### `issues list` — Issue の一覧取得

引数の例：
- `issues list` — open な Issue を一覧表示
- `issues list --state closed` — closed な Issue を一覧表示
- `issues list --labels bug` — 特定ラベルの Issue を一覧表示

```bash
curl -s \
  --http2 \
  --compressed \
  --connect-timeout 5 \
  --max-time 15 \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{OWNER/REPO}/issues?state=open&per_page=30"
```

クエリパラメータ（ユーザー指定があれば適用）：
- `state` : `open`（デフォルト）, `closed`, `all`
- `labels` : カンマ区切りのラベル名
- `assignee` : アサイン先のユーザー名
- `per_page` : 取得件数（デフォルト 30、最大 100）

**注意**: GitHub Issues API は Pull Request も返す。表示時に `pull_request` キーを持つ項目を除外して、純粋な Issue のみを表示すること。

結果は以下の形式で整形して伝える：
```
#番号  タイトル  [ラベル]  作成者  作成日
```

---

### `issues create` — Issue の作成

引数の例：
- `issues create "バグ: ログイン画面でエラー"` — タイトルのみで作成
- `issues create "機能追加" --body "詳細な説明"` — タイトルと本文
- `issues create "バグ修正" --labels "bug,urgent"` — ラベル付きで作成

```bash
curl -s \
  --http2 \
  --compressed \
  --connect-timeout 5 \
  --max-time 15 \
  -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{OWNER/REPO}/issues" \
  -d '{
    "title": "<タイトル>",
    "body": "<本文（省略可）>",
    "labels": ["<ラベル1>", "<ラベル2>"],
    "assignees": ["<ユーザー名>"]
  }'
```

必須: `title`（未指定の場合はユーザーに確認する）
任意: `body`, `labels`, `assignees`（未指定なら JSON から省略する）

作成成功時は Issue 番号・URL・タイトルを伝える。

---

### `pr list` — Pull Request の一覧取得

引数の例：
- `pr list` — open な PR を一覧表示
- `pr list --state closed` — closed な PR を一覧表示
- `pr list --state all` — 全ての PR を一覧表示

```bash
curl -s \
  --http2 \
  --compressed \
  --connect-timeout 5 \
  --max-time 15 \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{OWNER/REPO}/pulls?state=open&per_page=30"
```

クエリパラメータ（ユーザー指定があれば適用）：
- `state` : `open`（デフォルト）, `closed`, `all`
- `head` : フィルタするブランチ
- `base` : ベースブランチでフィルタ
- `per_page` : 取得件数（デフォルト 30、最大 100）

結果は以下の形式で整形して伝える：
```
#番号  タイトル  head → base  作成者  作成日
```

---

### `pr create` — Pull Request の作成

引数の例：
- `pr create "機能追加: ダークモード"` — 現在のブランチから main への PR
- `pr create "修正" --base develop` — ベースブランチを指定
- `pr create "機能" --body "## 概要\n詳細説明" --draft` — 下書きとして作成

前提条件確認で取得済みの `{CURRENT_BRANCH}` を使用する。main/master の場合はユーザーに警告する。

```bash
curl -s \
  --http2 \
  --compressed \
  --connect-timeout 5 \
  --max-time 15 \
  -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{OWNER/REPO}/pulls" \
  -d '{
    "title": "<タイトル>",
    "body": "<本文（省略可）>",
    "head": "{CURRENT_BRANCH}",
    "base": "main",
    "draft": false
  }'
```

必須: `title`, `head`（自動検出）, `base`（デフォルト: `main`）
任意: `body`, `draft`（`--draft` 指定時に `true`）

作成成功時は PR 番号・URL・タイトル・head → base を伝える。

---

## エラーハンドリング

API レスポンスに `"message"` キーが含まれている場合はエラーとして扱う。

| HTTP ステータス | 意味 | 対応 |
|---|---|---|
| 401 | Bad credentials | トークンの有効期限切れ or 無効を伝える |
| 403 | 権限不足 / レートリミット | 権限設定の確認を案内する |
| 404 | Not Found | リポジトリへのアクセス権がないことを伝える |
| 422 | Validation Failed | リクエスト内容の不備を具体的に伝える |

## 出力の言語

ユーザーへの説明・整形結果は日本語で出力する。
