#!/usr/bin/env bash
# =============================================================================
# Newton House — Patna Science College Alumni Association
# Advanced Interactive GitHub Deployment Script  (v2.0)
#
# Target Repository: https://github.com/Ashraf-ISM/newton-house-alumni
#
# Every run ASKS for a commit message (guided Conventional-Commit wizard).
#
# Usage:
#   bash scripts/push-github.sh [options]
#
# Options:
#   -m, --message <msg>   Pre-fill the commit summary (you are still asked)
#   -b, --branch <name>   Target branch (default: main)
#   -r, --remote <name>   Remote name (default: origin)
#   -t, --tag <version>   Create + push an annotated tag (e.g. v1.2.0)
#       --ssh             Use SSH remote instead of HTTPS
#       --simple          Skip the wizard; ask for a single free-form line
#       --verify          Run typecheck + lint before committing
#       --build           Run production build before committing
#       --pull            Always rebase on remote changes before pushing
#       --force           Push with --force-with-lease (use carefully)
#       --dry-run         Do everything except the final push
#   -y, --yes             Skip the final "push now?" confirmation
#                         (the commit message prompt is NEVER skipped)
#   -h, --help            Show this help message
# =============================================================================

set -Eeuo pipefail

# -----------------------------------------------------------------------------
# Configuration & Defaults
# -----------------------------------------------------------------------------
readonly SCRIPT_VERSION="2.0"
readonly REPO_SLUG="Ashraf-ISM/newton-house-alumni"
readonly REPO_HTTPS="https://github.com/${REPO_SLUG}.git"
readonly REPO_SSH="git@github.com:${REPO_SLUG}.git"
readonly REPO_WEB="https://github.com/${REPO_SLUG}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly PROJECT_ROOT

BRANCH="main"
REMOTE_NAME="origin"
REMOTE_URL="${REPO_HTTPS}"
PRESET_MSG=""
TAG_NAME=""
SIMPLE_MODE=false
RUN_VERIFY=false
RUN_BUILD=false
ALWAYS_PULL=false
FORCE_PUSH=false
DRY_RUN=false
ASSUME_YES=false

COMMIT_MSG_FILE=""
LOCK_DIR=""
LOG_FILE=""
STARTED_AT="$(date +%s)"

# -----------------------------------------------------------------------------
# Terminal Styling
# -----------------------------------------------------------------------------
if [[ -t 1 ]]; then
  readonly C_RESET=$'\033[0m' C_BOLD=$'\033[1m' C_DIM=$'\033[2m'
  readonly C_GOLD=$'\033[38;5;179m' C_GREEN=$'\033[38;5;71m'
  readonly C_RED=$'\033[38;5;167m' C_BLUE=$'\033[38;5;75m'
else
  readonly C_RESET="" C_BOLD="" C_DIM="" C_GOLD="" C_GREEN="" C_RED="" C_BLUE=""
fi

_log_file() { [[ -n "${LOG_FILE}" ]] && printf "[%s] %s\n" "$(date '+%F %T')" "$1" >>"${LOG_FILE}" 2>/dev/null || true; }
log_header()  { printf "\n%s%s▸ %s%s\n" "${C_BOLD}" "${C_GOLD}" "$1" "${C_RESET}"; _log_file "== $1"; }
log_info()    { printf "  %s•%s %s\n" "${C_BLUE}" "${C_RESET}" "$1"; _log_file "$1"; }
log_success() { printf "  %s✓%s %s\n" "${C_GREEN}" "${C_RESET}" "$1"; _log_file "OK: $1"; }
log_warn()    { printf "  %s!%s %s\n" "${C_GOLD}" "${C_RESET}" "$1" >&2; _log_file "WARN: $1"; }
log_error()   { printf "\n  %s✗ Error:%s %s\n\n" "${C_RED}${C_BOLD}" "${C_RESET}" "$1" >&2; _log_file "ERROR: $1"; }

usage() {
  sed -n '2,31p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 0
}

# -----------------------------------------------------------------------------
# Cleanup / Traps
# -----------------------------------------------------------------------------
cleanup() {
  [[ -n "${COMMIT_MSG_FILE}" && -f "${COMMIT_MSG_FILE}" ]] && rm -f "${COMMIT_MSG_FILE}"
  [[ -n "${LOCK_DIR}" && -d "${LOCK_DIR}" ]] && rmdir "${LOCK_DIR}" 2>/dev/null || true
}
on_error() {
  local code=$? line=$1
  log_error "Script failed at line ${line} (exit code ${code}). Staged changes were left intact."
  exit "${code}"
}
on_interrupt() {
  printf "\n"
  log_warn "Interrupted by user. Nothing was pushed."
  exit 130
}
trap cleanup EXIT
trap 'on_error ${LINENO}' ERR
trap on_interrupt INT TERM

# -----------------------------------------------------------------------------
# Interactive helpers (read from the terminal even if stdin is piped)
# -----------------------------------------------------------------------------
TTY_IN="/dev/stdin"
if [[ -r /dev/tty ]] && { : </dev/tty; } 2>/dev/null; then TTY_IN="/dev/tty"; fi

require_interactive() {
  if [[ ! -t 0 && "${TTY_IN}" != "/dev/tty" ]]; then
    log_error "No interactive terminal available. A commit message must be entered on each run."
    exit 1
  fi
}

# ask "Prompt" "default"  -> sets REPLY
ask() {
  local prompt="$1" default="${2:-}" shown=""
  [[ -n "${default}" ]] && shown=" ${C_DIM}[${default}]${C_RESET}"
  printf "  %s?%s %s%s: " "${C_GOLD}" "${C_RESET}" "${prompt}" "${shown}" >&2
  IFS= read -r REPLY <"${TTY_IN}" || REPLY=""
  [[ -z "${REPLY}" ]] && REPLY="${default}"
  return 0
}

# confirm "Question" "Y|N"  -> returns 0 for yes
confirm() {
  local question="$1" default="${2:-Y}" hint
  [[ "${default}" == "Y" ]] && hint="Y/n" || hint="y/N"
  while true; do
    printf "  %s?%s %s %s(%s)%s: " "${C_GOLD}" "${C_RESET}" "${question}" "${C_DIM}" "${hint}" "${C_RESET}" >&2
    IFS= read -r REPLY <"${TTY_IN}" || REPLY=""
    REPLY="${REPLY:-${default}}"
    case "${REPLY}" in
      [Yy]|[Yy][Ee][Ss]) return 0 ;;
      [Nn]|[Nn][Oo])     return 1 ;;
      *) printf "    Please answer y or n.\n" >&2 ;;
    esac
  done
}

# -----------------------------------------------------------------------------
# Parse CLI Arguments
# -----------------------------------------------------------------------------
need_val() { [[ $# -lt 2 || -z "${2:-}" ]] && { log_error "Missing value for $1"; exit 1; }; return 0; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message) need_val "$@"; PRESET_MSG="$2"; shift 2 ;;
    -b|--branch)  need_val "$@"; BRANCH="$2"; shift 2 ;;
    -r|--remote)  need_val "$@"; REMOTE_NAME="$2"; shift 2 ;;
    -t|--tag)     need_val "$@"; TAG_NAME="$2"; shift 2 ;;
    --ssh)        REMOTE_URL="${REPO_SSH}"; shift ;;
    --simple)     SIMPLE_MODE=true; shift ;;
    --verify)     RUN_VERIFY=true; shift ;;
    --build)      RUN_BUILD=true; shift ;;
    --pull)       ALWAYS_PULL=true; shift ;;
    --force)      FORCE_PUSH=true; shift ;;
    --dry-run)    DRY_RUN=true; shift ;;
    -y|--yes)     ASSUME_YES=true; shift ;;
    -h|--help)    usage ;;
    *) log_error "Unknown option: $1 (run with --help for usage)"; exit 1 ;;
  esac
done

# -----------------------------------------------------------------------------
# 1. Pre-flight Checks
# -----------------------------------------------------------------------------
cd "${PROJECT_ROOT}"

printf "%s%s============================================================%s\n" "${C_BOLD}" "${C_GOLD}" "${C_RESET}"
printf "%s  NEWTON HOUSE — GitHub Push Utility  v%s%s\n" "${C_BOLD}" "${SCRIPT_VERSION}" "${C_RESET}"
printf "  %s%s%s\n" "${C_DIM}" "${REMOTE_URL}" "${C_RESET}"
printf "%s%s============================================================%s\n" "${C_BOLD}" "${C_GOLD}" "${C_RESET}"

require_interactive
log_header "1. Running pre-flight checks"

command -v git >/dev/null 2>&1 || { log_error "git is not installed or not in PATH."; exit 1; }
log_success "Git detected: $(git --version)"

[[ -f "package.json" ]] || { log_error "package.json not found in ${PROJECT_ROOT}."; exit 1; }
[[ -f ".gitignore"  ]] || { log_error ".gitignore is missing. Refusing to stage files without ignore rules."; exit 1; }
log_success "Workspace verified: ${PROJECT_ROOT}"

# Tag name sanity
if [[ -n "${TAG_NAME}" ]] && ! [[ "${TAG_NAME}" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+([-.+][0-9A-Za-z.-]+)?$ ]]; then
  log_error "Tag '${TAG_NAME}' is not semantic (expected e.g. v1.2.0)."
  exit 1
fi

# safe.directory for mounted / external filesystems
if ! git config --global --get-all safe.directory 2>/dev/null | grep -Fxq "${PROJECT_ROOT}"; then
  git config --global --add safe.directory "${PROJECT_ROOT}" || true
  log_info "Registered ${PROJECT_ROOT} in git global safe.directory"
fi

# Init repo early (needed for the lock + log under .git)
if [[ ! -d ".git" ]]; then
  git init -b "${BRANCH}" >/dev/null
  log_success "Initialized new Git repository on branch '${BRANCH}'"
fi

LOG_FILE="${PROJECT_ROOT}/.git/push-github.log"
LOCK_DIR="${PROJECT_ROOT}/.git/push-github.lock"
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  LOCK_DIR=""   # don't remove a lock we don't own
  log_error "Another push-github run appears to be active. If not, delete .git/push-github.lock"
  exit 1
fi

# Rebase / merge in progress?
for marker in rebase-merge rebase-apply MERGE_HEAD CHERRY_PICK_HEAD; do
  if [[ -e ".git/${marker}" ]]; then
    log_error "A git operation is in progress (${marker}). Finish or abort it first."
    exit 1
  fi
done
log_success "No conflicting git operation in progress"

# -----------------------------------------------------------------------------
# 2. Optional Quality Gates
# -----------------------------------------------------------------------------
log_header "2. Quality gates"
if [[ "${RUN_VERIFY}" == true ]]; then
  log_info "Running TypeScript typecheck…"
  npm run typecheck
  log_info "Running ESLint…"
  npm run lint
  log_success "Typecheck and lint passed"
else
  log_info "Typecheck/lint skipped (use --verify)"
fi
if [[ "${RUN_BUILD}" == true ]]; then
  log_info "Running production build…"
  npm run build
  log_success "Build succeeded"
else
  log_info "Build skipped (use --build)"
fi

# -----------------------------------------------------------------------------
# 3. Configure Git Repository
# -----------------------------------------------------------------------------
log_header "3. Configuring Git repository"

git config core.fileMode false
git config core.autocrlf input

GIT_USER_NAME="$(git config user.name || true)"
GIT_USER_EMAIL="$(git config user.email || true)"
if [[ -z "${GIT_USER_NAME}" || -z "${GIT_USER_EMAIL}" ]]; then
  log_warn "Git identity is not configured."
  ask "Your name"  ""; GIT_USER_NAME="${REPLY}"
  ask "Your email" ""; GIT_USER_EMAIL="${REPLY}"
  if [[ -z "${GIT_USER_NAME}" || -z "${GIT_USER_EMAIL}" ]]; then
    log_error "Name and email are required to commit."
    exit 1
  fi
  git config user.name  "${GIT_USER_NAME}"
  git config user.email "${GIT_USER_EMAIL}"
  log_info "Saved identity to this repository's local config"
fi
log_success "Author identity: ${GIT_USER_NAME} <${GIT_USER_EMAIL}>"

CURRENT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || true)"
if [[ "${CURRENT_BRANCH}" != "${BRANCH}" ]]; then
  git checkout -B "${BRANCH}" >/dev/null 2>&1
  log_info "Switched to branch '${BRANCH}'"
else
  log_success "On branch '${BRANCH}'"
fi

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
# 4. Stage Files & Security / Hygiene Audit
# -----------------------------------------------------------------------------
log_header "4. Staging files & running audits"

git add -A

# 4a. Forbidden filenames
FORBIDDEN_STAGED="$(
  git diff --cached --name-only \
    | grep -E '(^|/)\.env(\..+)?$|\.(pem|key|p12|pfx|keystore)$|(^|/)id_(rsa|ed25519)$' \
    | grep -Ev '(^|/)\.env\.example$' || true
)"
if [[ -n "${FORBIDDEN_STAGED}" ]]; then
  git reset >/dev/null
  log_error "Sensitive file(s) detected in staging area! Aborting:
${FORBIDDEN_STAGED}"
  exit 1
fi
log_success "No .env / private key files staged"

# 4b. Merge conflict markers
if git diff --cached --check 2>/dev/null | grep -qi 'conflict marker'; then
  git reset >/dev/null
  log_error "Merge conflict markers found in staged files. Resolve them first."
  exit 1
fi
log_success "No conflict markers"

# 4c. Oversized files (GitHub: warn > 50 MB, hard block > 100 MB)
while IFS= read -r f; do
  [[ -z "${f}" ]] && continue
  size="$(git cat-file -s ":${f}" 2>/dev/null || echo 0)"
  if (( size > 104857600 )); then
    git reset >/dev/null
    log_error "'${f}' is $((size / 1048576)) MB — exceeds GitHub's 100 MB limit."
    exit 1
  elif (( size > 52428800 )); then
    log_warn "'${f}' is $((size / 1048576)) MB (GitHub warns above 50 MB)."
  fi
done < <(git diff --cached --name-only --diff-filter=AM)
log_success "File size check passed"

# 4d. Secret pattern scan on added lines
SECRET_REGEX='AKIA[0-9A-Z]{16}|-----BEGIN ([A-Z]+ )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{32,}|(password|secret|api[_-]?key|token)[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']{8,}["'"'"']'
SECRET_HITS="$(git diff --cached -U0 --no-color | grep -E '^\+[^+]' | grep -Ei "${SECRET_REGEX}" | cut -c1-90 || true)"
if [[ -n "${SECRET_HITS}" ]]; then
  log_warn "Possible secrets found in added lines:"
  printf "%s\n" "${SECRET_HITS}" | head -n 8 | sed 's/^/      /' >&2
  if ! confirm "These look like credentials. Continue anyway?" "N"; then
    git reset >/dev/null
    log_error "Aborted. Staging area was reset."
    exit 1
  fi
else
  log_success "No secret patterns detected in the diff"
fi

# -----------------------------------------------------------------------------
# 5. Review & Commit  (commit message is ALWAYS requested)
# -----------------------------------------------------------------------------
log_header "5. Review changes & create commit"

HAS_STAGED=true
git diff --cached --quiet && HAS_STAGED=false

if [[ "${HAS_STAGED}" == true ]]; then
  printf "\n%s  Change summary%s\n" "${C_BOLD}" "${C_RESET}"
  git diff --cached --stat --stat-width=78 | sed 's/^/    /'
  ADDED="$(git diff --cached --name-status | grep -c '^A' || true)"
  MODIFIED="$(git diff --cached --name-status | grep -c '^M' || true)"
  DELETED="$(git diff --cached --name-status | grep -c '^D' || true)"
  RENAMED="$(git diff --cached --name-status | grep -c '^R' || true)"
  printf "\n    %s%s%s added   %s%s%s modified   %s%s%s deleted   %s%s%s renamed\n\n" \
    "${C_GREEN}" "${ADDED}" "${C_RESET}" "${C_GOLD}" "${MODIFIED}" "${C_RESET}" \
    "${C_RED}" "${DELETED}" "${C_RESET}" "${C_BLUE}" "${RENAMED}" "${C_RESET}"

  COMMIT_MSG_FILE="$(mktemp "${TMPDIR:-/tmp}/newton-commit.XXXXXX")"

  build_wizard_message() {
    local types=(feat fix docs style refactor perf test build ci chore revert)
    local descs=("New feature" "Bug fix" "Documentation" "Formatting / styling" "Code restructure" \
                 "Performance" "Tests" "Build / dependencies" "CI / CD" "Maintenance" "Revert a change")
    local i choice type scope summary body="" line breaking=false

    printf "  %sCommit type%s\n" "${C_BOLD}" "${C_RESET}"
    for i in "${!types[@]}"; do
      printf "    %2d) %-9s %s%s%s\n" "$((i + 1))" "${types[$i]}" "${C_DIM}" "${descs[$i]}" "${C_RESET}"
    done
    printf "     0) custom    %sfree-form message, no prefix%s\n\n" "${C_DIM}" "${C_RESET}"

    while true; do
      ask "Choose type (0-${#types[@]})" "10"
      choice="${REPLY}"
      if [[ "${choice}" =~ ^[0-9]+$ ]] && (( choice >= 0 && choice <= ${#types[@]} )); then break; fi
      printf "    Invalid choice.\n" >&2
    done

    if (( choice == 0 )); then
      type=""
    else
      type="${types[$((choice - 1))]}"
      ask "Scope (optional, e.g. auth, events, ui)" ""
      scope="${REPLY}"
    fi

    while true; do
      ask "Short summary (required, ≤72 chars)" "${PRESET_MSG}"
      summary="${REPLY}"
      if [[ -z "${summary}" ]]; then printf "    A summary is required.\n" >&2; continue; fi
      if (( ${#summary} > 72 )); then
        confirm "Summary is ${#summary} chars (>72). Keep it?" "N" || continue
      fi
      break
    done

    printf "  %s?%s Detailed description %s(optional — finish with an empty line)%s:\n" \
      "${C_GOLD}" "${C_RESET}" "${C_DIM}" "${C_RESET}" >&2
    while true; do
      printf "      " >&2
      IFS= read -r line <"${TTY_IN}" || line=""
      [[ -z "${line}" ]] && break
      body+="${line}"$'\n'
    done

    if [[ -n "${type}" ]]; then
      confirm "Is this a BREAKING change?" "N" && breaking=true
    fi

    local header="${summary}"
    if [[ -n "${type}" ]]; then
      header="${type}"
      [[ -n "${scope}" ]] && header+="(${scope})"
      [[ "${breaking}" == true ]] && header+="!"
      header+=": ${summary}"
    fi

    {
      printf "%s\n" "${header}"
      [[ -n "${body}" ]] && printf "\n%s" "${body}"
      if [[ "${breaking}" == true ]]; then
        ask "Describe the breaking change" "${summary}"
        printf "\nBREAKING CHANGE: %s\n" "${REPLY}"
      fi
    } >"${COMMIT_MSG_FILE}"
  }

  build_simple_message() {
    local msg
    while true; do
      ask "Commit message" "${PRESET_MSG}"
      msg="${REPLY}"
      [[ -n "${msg}" ]] && break
      printf "    A commit message is required.\n" >&2
    done
    printf "%s\n" "${msg}" >"${COMMIT_MSG_FILE}"
  }

  # Ask → preview → accept / edit / redo / cancel
  while true; do
    if [[ "${SIMPLE_MODE}" == true ]]; then build_simple_message; else build_wizard_message; fi

    printf "\n  %sCommit message preview%s\n" "${C_BOLD}" "${C_RESET}"
    printf "  %s┌──────────────────────────────────────────────%s\n" "${C_DIM}" "${C_RESET}"
    sed 's/^/  │ /' "${COMMIT_MSG_FILE}"
    printf "  %s└──────────────────────────────────────────────%s\n\n" "${C_DIM}" "${C_RESET}"

    ask "[a]ccept  [e]dit in editor  [r]etype  [c]ancel" "a"
    case "${REPLY}" in
      a|A|"") break ;;
      e|E)
        "${EDITOR:-${VISUAL:-vi}}" "${COMMIT_MSG_FILE}" <"${TTY_IN}" >/dev/tty 2>&1 || true
        if [[ -z "$(tr -d '[:space:]' <"${COMMIT_MSG_FILE}")" ]]; then
          log_warn "Edited message is empty — starting over."
          continue
        fi
        break
        ;;
      r|R) continue ;;
      c|C)
        git reset >/dev/null
        log_warn "Cancelled. Staging area was reset; nothing was committed."
        exit 0
        ;;
      *) break ;;
    esac
  done

  STAGED_COUNT="$(git diff --cached --name-only | wc -l | tr -d ' ')"
  git commit -F "${COMMIT_MSG_FILE}" >/dev/null
  COMMIT_HASH="$(git rev-parse --short HEAD)"
  log_success "Committed ${STAGED_COUNT} file(s) [${COMMIT_HASH}]: $(head -n1 "${COMMIT_MSG_FILE}")"
else
  log_info "No new file changes to commit."
  if git rev-parse --verify HEAD >/dev/null 2>&1; then
    log_info "Continuing with existing commits (a commit message is not needed — nothing to commit)."
  fi
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  log_error "Repository has no commits to push."
  exit 1
fi

# -----------------------------------------------------------------------------
# 6. Optional Tag
# -----------------------------------------------------------------------------
if [[ -n "${TAG_NAME}" ]]; then
  log_header "6. Tagging release"
  if git rev-parse -q --verify "refs/tags/${TAG_NAME}" >/dev/null; then
    log_warn "Tag '${TAG_NAME}' already exists locally — skipping tag creation."
  else
    ask "Tag annotation" "Release ${TAG_NAME}"
    git tag -a "${TAG_NAME}" -m "${REPLY}"
    log_success "Created tag ${TAG_NAME}"
  fi
else
  log_header "6. Tagging"
  log_info "No tag requested (use --tag v1.0.0)"
fi

# -----------------------------------------------------------------------------
# 7. Sync with Remote
# -----------------------------------------------------------------------------
log_header "7. Checking remote status"

REMOTE_REACHABLE=true
if ! git ls-remote --exit-code --heads "${REMOTE_NAME}" >/dev/null 2>&1; then
  # Either the repo is empty (exit 2) or unreachable (exit 128)
  rc=0; git ls-remote --exit-code --heads "${REMOTE_NAME}" >/dev/null 2>&1 || rc=$?
  if (( rc == 2 )); then
    log_info "Remote is reachable but has no branches yet (first push)."
  else
    REMOTE_REACHABLE=false
    log_warn "Could not reach remote (check network / credentials)."
  fi
fi

if [[ "${REMOTE_REACHABLE}" == true ]] && git ls-remote --exit-code --heads "${REMOTE_NAME}" "${BRANCH}" >/dev/null 2>&1; then
  git fetch "${REMOTE_NAME}" "${BRANCH}" --quiet
  read -r AHEAD BEHIND < <(git rev-list --left-right --count "HEAD...${REMOTE_NAME}/${BRANCH}" | tr '\t' ' ')
  log_info "Local is ${AHEAD} commit(s) ahead, ${BEHIND} behind ${REMOTE_NAME}/${BRANCH}"

  if (( BEHIND > 0 )) && [[ "${FORCE_PUSH}" != true ]]; then
    if [[ "${ALWAYS_PULL}" == true ]] || confirm "Remote has ${BEHIND} new commit(s). Rebase on top of them now?" "Y"; then
      if git pull --rebase --autostash "${REMOTE_NAME}" "${BRANCH}"; then
        log_success "Rebased on ${REMOTE_NAME}/${BRANCH}"
      else
        log_error "Rebase hit conflicts. Resolve them, run 'git rebase --continue', then re-run this script."
        exit 1
      fi
    fi
  fi
fi

# -----------------------------------------------------------------------------
# 8. Push to GitHub
# -----------------------------------------------------------------------------
log_header "8. Pushing to GitHub (${REMOTE_NAME}/${BRANCH})"

if [[ "${DRY_RUN}" == true ]]; then
  log_warn "Dry-run mode enabled — skipping 'git push'."
  git push --dry-run -u "${REMOTE_NAME}" "${BRANCH}" 2>&1 | sed 's/^/    /' || true
  exit 0
fi

if [[ "${ASSUME_YES}" != true ]]; then
  confirm "Push to ${REMOTE_NAME}/${BRANCH} now?" "Y" || { log_warn "Push skipped. Your commit is saved locally."; exit 0; }
fi

PUSH_ARGS=(-u "${REMOTE_NAME}" "${BRANCH}")
if [[ "${FORCE_PUSH}" == true ]]; then
  log_warn "Force push requested (--force-with-lease)."
  confirm "This can overwrite remote history. Really continue?" "N" || { log_warn "Aborted."; exit 0; }
  PUSH_ARGS=(--force-with-lease -u "${REMOTE_NAME}" "${BRANCH}")
fi

push_with_retry() {
  local attempt max=3 delay=3
  for (( attempt = 1; attempt <= max; attempt++ )); do
    if git push "${PUSH_ARGS[@]}"; then return 0; fi
    if (( attempt < max )); then
      log_warn "Push attempt ${attempt}/${max} failed — retrying in ${delay}s…"
      sleep "${delay}"; delay=$((delay * 2))
    fi
  done
  return 1
}

if push_with_retry; then
  [[ -n "${TAG_NAME}" ]] && git push "${REMOTE_NAME}" "${TAG_NAME}" && log_success "Pushed tag ${TAG_NAME}"
  ELAPSED=$(( $(date +%s) - STARTED_AT ))
  FINAL_HASH="$(git rev-parse --short HEAD)"
  printf "\n%s%s✓ Successfully pushed to %s (branch: %s)%s\n" "${C_BOLD}" "${C_GREEN}" "${REPO_WEB}" "${BRANCH}" "${C_RESET}"
  printf "  %sCommit:%s  %s/commit/%s\n" "${C_DIM}" "${C_RESET}" "${REPO_WEB}" "$(git rev-parse HEAD)"
  [[ -n "${TAG_NAME}" ]] && printf "  %sRelease:%s %s/releases/tag/%s\n" "${C_DIM}" "${C_RESET}" "${REPO_WEB}" "${TAG_NAME}"
  printf "  %sDone in %ss (HEAD %s)%s\n\n" "${C_DIM}" "${ELAPSED}" "${FINAL_HASH}" "${C_RESET}"
  _log_file "PUSHED ${FINAL_HASH} to ${REMOTE_NAME}/${BRANCH}"
else
  log_warn "Push was rejected (remote may contain commits not present locally)."
  printf "\n  To integrate remote history and push, run:\n"
  printf "    %sgit pull --rebase %s %s --allow-unrelated-histories && git push -u %s %s%s\n" \
    "${C_BOLD}" "${REMOTE_NAME}" "${BRANCH}" "${REMOTE_NAME}" "${BRANCH}" "${C_RESET}"
  printf "  Or to overwrite the remote branch with this local repository:\n"
  printf "    %sbash scripts/push-github.sh --force%s\n\n" "${C_BOLD}" "${C_RESET}"
  exit 1
fi