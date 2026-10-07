#!/usr/bin/env bash
# === scripts/setup-github-security.sh ===
# main ブランチにブランチ保護ルールを設定する。
#
# 前提:
#   - GitHub CLI (gh) がインストール済み・ `gh auth login` 済みであること
#   - このスクリプトはリポジトリの管理者権限を持つ人が、リポジトリのルートで実行する
#   - このスクリプトは Claude（AI）は実行していません。GitHubの実アカウント/リポジトリを
#     変更する操作のため、必ず中身を確認した上で、あなた自身の判断で実行してください。
#
# 設定内容:
#   - main への直接プッシュを禁止（PR必須）
#   - PRのマージには最低1件のレビュー承認を必須化
#   - CI（build/validate と security-scan の各ジョブ）がグリーンでないとマージ不可
#   - force-push / ブランチ削除を禁止
#   - 管理者にも同じルールを適用（enforce_admins）
#
# 使い方:
#   chmod +x scripts/setup-github-security.sh   # 既に実行権限は付与済み
#   ./scripts/setup-github-security.sh [owner/repo]
#   # 引数省略時はカレントディレクトリのリポジトリを自動検出します

set -euo pipefail

REPO="${1:-}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) が見つかりません。https://cli.github.com/ からインストールしてください" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh にログインしていません。先に 'gh auth login' を実行してください" >&2
  exit 1
fi

if [ -z "$REPO" ]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
  if [ -z "$REPO" ]; then
    echo "ERROR: リポジトリを自動検出できませんでした。'./setup-github-security.sh owner/repo' の形式で指定してください" >&2
    exit 1
  fi
fi

BRANCH="main"

echo "対象リポジトリ: $REPO"
echo "対象ブランチ  : $BRANCH"
echo

# 実際に main ブランチが存在するか確認（存在しないリポジトリに対して誤爆しないように）
if ! gh api "repos/$REPO/branches/$BRANCH" >/dev/null 2>&1; then
  echo "ERROR: $REPO に '$BRANCH' ブランチが見つかりません。ブランチ名を確認してください" >&2
  exit 1
fi

# --- CIのステータスチェック名 ---
# .github/workflows/deploy.yml の job 名は "deploy"、
# .github/workflows/security-scan.yml の job 名は "codeql" と "secret-scan"。
# ※ GitHub の必須チェック名は「ジョブ名」であり、ワークフロー名やステップ名ではない点に注意。
#    ジョブ名を変更した場合はここも合わせて変更すること。
CONTEXTS='["deploy","codeql","secret-scan"]'

echo "以下の内容で '$BRANCH' にブランチ保護ルールを適用します:"
echo "  - 直接プッシュ禁止（PR必須、承認1件以上）"
echo "  - 必須ステータスチェック: deploy, codeql, secret-scan"
echo "  - force-push / ブランチ削除禁止、管理者にも適用"
echo

read -r -p "続行しますか？ [y/N] " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "中止しました。"
  exit 0
fi

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/$REPO/branches/$BRANCH/protection" \
  --input - <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ${CONTEXTS}
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": true
}
JSON

echo
echo "✅ 適用しました。設定内容は以下で確認できます:"
echo "   gh api repos/$REPO/branches/$BRANCH/protection"
echo "   または GitHub の Settings → Branches"
