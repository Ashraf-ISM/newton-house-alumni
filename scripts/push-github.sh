#!/usr/bin/env bash
# =============================================================================
# Newton House — Patna Science College Alumni Association
# Professional GitHub Deployment & Push Script
#
# Target Repository: https://github.com/Ashraf-ISM/newton-house-alumni
#
# Usage:
#   bash scripts/push-github.sh [options]
#
# Options:
#   -m, --message <msg>   Custom commit message
#   -b, --branch <name>   Target branch (default: main)
#   --ssh                 Use SSH remote (git@github.com:Ashraf-ISM/newton-house-alumni.git)
#   --verify              Run typecheck and ESLint before committing
#   --force               Push with --force-with-lease (use carefully)
#   --dry-run             Stage and validate without pushing to remote
#   -h, --help            Show this help message
# =============================================================================

set -Eeuo pipefail

# -----------------------------------------------------------------------------
# Configuration & Defaults
# -----------------------------------------------------------------------------
readonly REPO_HTTPS="https://github.com/Ashraf-ISM/newton-house-alumni.git"
readonly REPO_SSH="git@github.com:Ashraf-ISM/newton-house-alumni.git"
readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BRANCH="main"
REMOTE_NAME="origin"
REMOTE_URL="${REPO_HTTPS}"
COMMIT_MSG=""
RUN_VERIFY=false
FORCE_PUSH=false
DRY_RUN=false

# -----------------------------------------------------------------------------
# Terminal Styling
# -----------------------------------------------------------------------------
if [[ -t 1 ]]; then
  readonly C_RESET=$'\033[0m'
  readonly C_BOLD=$'\033[1m'
  readonly C_DIM=$'\033[2m'
  readonly C_GOLD=$'\033[38;5;179m'
  readonly C_GREEN=$'\033[38;5;71m'
  readonly C_RED=$'\033[38;5;167m'
  readonly C_BLUE=$'\033[38;5;75m'
else
  readonly C_RESET="" C_BOLD="" C_DIM="" C_GOLD="" C_GREEN="" C_RED="" C_BLUE=""
fi

log_header()  { printf "\n%s%s▸ %s%s\n" "${C_BOLD}" "${C_GOLD}" "$1" "${C_RESET}"; }
log_info()    { printf "  %s•%s %s\n" "${C_BLUE}" "${C_RESET}" "$1"; }
log_success() { printf "  %s✓%s %s\n" "${C_GREEN}" "${C_RESET}" "$1"; }
log_warn()    { printf "  %s!%s %s\n" "${C_GOLD}" "${C_RESET}" "$1" >&2; }
log_error()   { printf "\n  %s✗ Error:%s %s\n\n" "${C_RED}${C_BOLD}" "${C_RESET}" "$1" >&2; }

usage() {
  sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 0
}

# -----------------------------------------------------------------------------
# Parse CLI Arguments
# -----------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      [[ $# -lt 2 ]] && { log_error "Missing value for $1"; exit 1; }
      COMMIT_MSG="$2"
      shift 2
      ;;
    -b|--branch)
      [[ $# -lt 2 ]] && { log_error "Missing value for $1"; exit 1; }
      BRANCH="$2"
      shift 2
      ;;
    --ssh)
      REMOTE_URL="${REPO_SSH}"
      shift
      ;;
    --verify)
      RUN_VERIFY=true
      shift
      ;;
    --force)
      FORCE_PUSH=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      log_error "Unknown option: $1 (run with --help for usage)"
      exit 1
      ;;
  esac
done

# -----------------------------------------------------------------------------
# 1. Pre-flight Checks
# -----------------------------------------------------------------------------
cd "${PROJECT_ROOT}"

printf "%s%s============================================================%s\n" "${C_BOLD}" "${C_GOLD}" "${C_RESET}"
printf "%s  NEWTON HOUSE — GitHub Push Utility%s\n" "${C_BOLD}" "${C_RESET}"
printf "  %s%s%s\n" "${C_DIM}" "${REMOTE_URL}" "${C_RESET}"
printf "%s%s============================================================%s\n" "${C_BOLD}" "${C_GOLD}" "${C_RESET}"

log_header "1. Running pre-flight checks"

if ! command -v git >/dev/null 2>&1; then
  log_error "git is not installed or not in PATH."
  exit 1
fi
log_success "Git detected: $(git --version)"

if [[ ! -f "package.json" ]]; then
  log_error "package.json not found in ${PROJECT_ROOT}."
  exit 1
fi

if [[ ! -f ".gitignore" ]]; then
  log_error ".gitignore is missing. Refusing to stage files without ignore rules."
  exit 1
fi
log_success "Workspace verified: ${PROJECT_ROOT}"

# Ensure Git allows operations on mounted / external filesystems (e.g. NTFS)
if ! git config --global --get-all safe.directory 2>/dev/null | grep -Fxq "${PROJECT_ROOT}"; then
  git config --global --add safe.directory "${PROJECT_ROOT}" || true
  log_info "Registered ${PROJECT_ROOT} in git global safe.directory"
fi

# -----------------------------------------------------------------------------
# 2. Optional Quality Gate (--verify)
# -----------------------------------------------------------------------------
if [[ "${RUN_VERIFY}" == true ]]; then
  log_header "2. Running quality checks (TypeScript & ESLint)"
  npm run typecheck
  npm run lint
  log_success "Typecheck and lint passed with zero errors"
else
  log_header "2. Quality checks"
  log_info "Skipped (pass --verify to run typecheck and lint before pushing)"
fi

# -----------------------------------------------------------------------------
# 3. Initialize / Configure Git Repository
# -----------------------------------------------------------------------------
log_header "3. Configuring Git repository"

if [[ ! -d ".git" ]]; then
  git init -b "${BRANCH}" >/dev/null
  log_success "Initialized new Git repository on branch '${BRANCH}'"
else
  log_success "Existing Git repository detected"
fi

# Prevent permission-bit noise on NTFS / cross-platform mounts
git config core.fileMode false
git config core.autocrlf input

# Ensure Git author identity is set
GIT_USER_NAME="$(git config user.name || true)"
GIT_USER_EMAIL="$(git config user.email || true)"
if [[ -z "${GIT_USER_NAME}" || -z "${GIT_USER_EMAIL}" ]]; then
  log_warn "Git user.name or user.email is not set."
  log_error "Configure your identity first:
    git config --global user.name \"Your Name\"
    git config --global user.email \"you@example.com\""
  exit 1
fi
log_success "Author identity: ${GIT_USER_NAME} <${GIT_USER_EMAIL}>"

# Ensure target branch is active
CURRENT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || true)"
if [[ "${CURRENT_BRANCH}" != "${BRANCH}" ]]; then
  git checkout -B "${BRANCH}" >/dev/null
  log_info "Switched to branch '${BRANCH}'"
fi

# Configure remote origin
if git remote get-url "${REMOTE_NAME}" >/dev/null 2>&1; then
  EXISTING_URL="$(git remote get-url "${REMOTE_NAME}")"
  if [[ "${EXISTING_URL}" != "${REMOTE_URL}" ]]; then
    git remote set-url "${REMOTE_NAME}" "${REMOTE_URL}"
    log_info "Updated '${REMOTE_NAME}' URL → ${REMOTE_URL}"
  else
    log_success "Remote '${REMOTE_NAME}' → ${REMOTE_URL}"
  fi
else
  git remote add "${REMOTE_NAME}" "${REMOTE_URL}"
  log_success "Added remote '${REMOTE_NAME}' → ${REMOTE_URL}"
fi

# -----------------------------------------------------------------------------
# 4. Stage Files & Run Secret Safety Audit
# -----------------------------------------------------------------------------
log_header "4. Staging files & running security audit"

git add -A

# Guard against accidentally staging .env files or private keys
FORBIDDEN_STAGED="$(
  git diff --cached --name-only \
    | grep -E '(^|/)\.env(\..+)?$|\.(pem|key)$' \
    | grep -Ev '(^|/)\.env\.example$' || true
)"

if [[ -n "${FORBIDDEN_STAGED}" ]]; then
  git reset >/dev/null
  log_error "Sensitive file(s) detected in staging area! Aborting commit:
${FORBIDDEN_STAGED}"
  exit 1
fi
log_success "Security check passed (no .env or private key files staged)"

# -----------------------------------------------------------------------------
# 5. Commit Changes
# -----------------------------------------------------------------------------
log_header "5. Creating commit"

if git diff --cached --quiet; then
  log_info "No new file changes to commit."
else
  if [[ -z "${COMMIT_MSG}" ]]; then
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
      COMMIT_MSG="chore: update Newton House Alumni Association platform"
    else
      COMMIT_MSG="feat: initial release of Newton House Alumni Association platform"
    fi
  fi

  STAGED_COUNT="$(git diff --cached --name-only | wc -l | tr -d ' ')"
  git commit -m "${COMMIT_MSG}" >/dev/null
  COMMIT_HASH="$(git rev-parse --short HEAD)"
  log_success "Committed ${STAGED_COUNT} file(s) [${COMMIT_HASH}]: ${COMMIT_MSG}"
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  log_error "Repository has no commits to push."
  exit 1
fi

# -----------------------------------------------------------------------------
# 6. Push to GitHub
# -----------------------------------------------------------------------------
log_header "6. Pushing to GitHub (${REMOTE_NAME}/${BRANCH})"

if [[ "${DRY_RUN}" == true ]]; then
  log_warn "Dry-run mode enabled — skipping 'git push'."
  exit 0
fi

PUSH_ARGS=(-u "${REMOTE_NAME}" "${BRANCH}")
if [[ "${FORCE_PUSH}" == true ]]; then
  PUSH_ARGS=(--force-with-lease -u "${REMOTE_NAME}" "${BRANCH}")
  log_warn "Pushing with --force-with-lease"
fi

if git push "${PUSH_ARGS[@]}"; then
  printf "\n%s%s✓ Successfully pushed to https://github.com/Ashraf-ISM/newton-house-alumni (branch: %s)%s\n\n" \
    "${C_BOLD}" "${C_GREEN}" "${BRANCH}" "${C_RESET}"
else
  log_warn "Push was rejected (the remote may contain commits not present locally, e.g. an initial README/LICENSE)."
  printf "\n  To integrate remote history and push, run:\n"
  printf "    %sgit pull --rebase %s %s --allow-unrelated-histories && git push -u %s %s%s\n" \
    "${C_BOLD}" "${REMOTE_NAME}" "${BRANCH}" "${REMOTE_NAME}" "${BRANCH}" "${C_RESET}"
  printf "  Or to overwrite the remote branch with this local repository, run:\n"
  printf "    %sbash scripts/push-github.sh --force%s\n\n" "${C_BOLD}" "${C_RESET}"
  exit 1
fi
