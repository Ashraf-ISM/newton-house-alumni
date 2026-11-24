#!/usr/bin/env bash
# =============================================================================
# Newton House — Simple GitHub Push Script
# Repo: https://github.com/Ashraf-ISM/newton-house-alumni
#
# Usage:  bash scripts/push-github.sh [--ssh] [--branch <name>] [--force]
# It asks ONE thing: the commit message.
# =============================================================================

set -Eeuo pipefail

REPO_HTTPS="https://github.com/Ashraf-ISM/newton-house-alumni.git"
REPO_SSH="git@github.com:Ashraf-ISM/newton-house-alumni.git"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BRANCH="main"
REMOTE="origin"
REMOTE_URL="${REPO_HTTPS}"
FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ssh)       REMOTE_URL="${REPO_SSH}"; shift ;;
    -b|--branch) BRANCH="${2:?Missing branch name}"; shift 2 ;;
    --force)     FORCE=true; shift ;;
    -h|--help)   sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

cd "${PROJECT_ROOT}"

[[ -f package.json ]] || { echo "✗ package.json not found in ${PROJECT_ROOT}"; exit 1; }
[[ -f .gitignore  ]] || { echo "✗ .gitignore missing — refusing to stage files"; exit 1; }

git config --global --add safe.directory "${PROJECT_ROOT}" 2>/dev/null || true
[[ -d .git ]] || git init -b "${BRANCH}" >/dev/null
git config core.fileMode false
git config core.autocrlf input

if [[ -z "$(git config user.name || true)" || -z "$(git config user.email || true)" ]]; then
  echo "✗ Set your Git identity first:"
  echo '    git config --global user.name "Your Name"'
  echo '    git config --global user.email "you@example.com"'
  exit 1
fi

git checkout -B "${BRANCH}" >/dev/null 2>&1

if git remote get-url "${REMOTE}" >/dev/null 2>&1; then
  git remote set-url "${REMOTE}" "${REMOTE_URL}"
else
  git remote add "${REMOTE}" "${REMOTE_URL}"
fi

# Stage + block secrets
git add -A
BAD="$(git diff --cached --name-only | grep -E '(^|/)\.env(\..+)?$|\.(pem|key)$' | grep -Ev '(^|/)\.env\.example$' || true)"
if [[ -n "${BAD}" ]]; then
  git reset >/dev/null
  echo "✗ Sensitive files staged, aborting:"
  echo "${BAD}"
  exit 1
fi

# Ask commit message (only when there are changes)
if git diff --cached --quiet; then
  echo "• Nothing new to commit."
else
  git diff --cached --stat | tail -n 1
  MSG=""
  while [[ -z "${MSG}" ]]; do
    read -r -p "Commit message: " MSG
  done
  git commit -m "${MSG}" >/dev/null
  echo "✓ Committed [$(git rev-parse --short HEAD)]: ${MSG}"
fi

git rev-parse --verify HEAD >/dev/null 2>&1 || { echo "✗ No commits to push"; exit 1; }

# Push
ARGS=(-u "${REMOTE}" "${BRANCH}")
[[ "${FORCE}" == true ]] && ARGS=(--force-with-lease "${ARGS[@]}")

if git push "${ARGS[@]}"; then
  echo "✓ Pushed to https://github.com/Ashraf-ISM/newton-house-alumni (${BRANCH})"
else
  echo "✗ Push rejected. Remote may have newer commits. Try:"
  echo "    git pull --rebase ${REMOTE} ${BRANCH} --allow-unrelated-histories && git push -u ${REMOTE} ${BRANCH}"
  exit 1
fi