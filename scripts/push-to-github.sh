#!/usr/bin/env bash
set -e

STATUS_FILE="$(git rev-parse --show-toplevel)/.github-backup-status"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
REPO_URL="https://github.com/Banalhaideri369/Healing-Haven"

write_status() {
  local result="$1"
  local detail="$2"
  printf '%s | %s | %s\n' "$TIMESTAMP" "$result" "$detail" > "$STATUS_FILE"
}

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN secret is not set." >&2
  echo "Add it in the Replit Secrets tab (Settings > Secrets) as a classic PAT with 'repo' scope." >&2
  REASON="GITHUB_TOKEN secret is not set"
  write_status "FAILED" "$REASON"
  bash "$SCRIPT_DIR/notify-backup-failure.sh" "$TIMESTAMP" "$REASON" "$REPO_URL" || true
  exit 1
fi

# Remove stale git lock files BEFORE any git write operations (config, remote set-url, push).
# Only removes locks outside objects/ — those are safe to clear when no other git process is running.
GIT_DIR="$(git rev-parse --git-dir)"
find "$GIT_DIR" -name "*.lock" -not -path "*/objects/*" -delete 2>/dev/null || true

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE_URL" != *"Banalhaideri369"* ]]; then
  echo "Fixing remote URL (username typo detected)..."
  git remote set-url origin "https://github.com/Banalhaideri369/Healing-Haven.git"
fi

# Set credential helper; guard so a failure here updates status and notifies instead of silent exit
if ! git config credential.helper '!f() { echo "username=x-access-token"; echo "password=${GITHUB_TOKEN}"; }; f' 2>&1; then
  REASON="git config credential.helper failed — check for .git/config.lock or permissions"
  write_status "FAILED" "$REASON"
  echo "ERROR: $REASON" >&2
  bash "$SCRIPT_DIR/notify-backup-failure.sh" "$TIMESTAMP" "$REASON" "$REPO_URL" || true
  exit 1
fi

echo "Pushing to GitHub..."
set +e
PUSH_OUTPUT=$(GIT_TERMINAL_PROMPT=0 git push origin main 2>&1)
PUSH_EXIT=$?
set -e

if [ $PUSH_EXIT -eq 0 ]; then
  echo "$PUSH_OUTPUT"
  echo "Done. Code is backed up at $REPO_URL"
  write_status "OK" "$REPO_URL"
elif echo "$PUSH_OUTPUT" | grep -q "fetch first\|non-fast-forward\|\[rejected\]"; then
  # Remote has diverged — Replit is the source of truth, force-push
  echo "Remote has diverged from local. Replit is the source of truth — force-pushing..."
  set +e
  FORCE_OUTPUT=$(GIT_TERMINAL_PROMPT=0 git push --force origin main 2>&1)
  FORCE_EXIT=$?
  set -e
  echo "$FORCE_OUTPUT"
  if [ $FORCE_EXIT -eq 0 ]; then
    echo "Done (force). Code is backed up at $REPO_URL"
    write_status "OK" "$REPO_URL"
  else
    REASON="git push --force exited with code $FORCE_EXIT — check GITHUB_TOKEN or repo access"
    write_status "FAILED" "$REASON"
    echo "ERROR: Force push failed (exit $FORCE_EXIT). Check GITHUB_TOKEN or repo permissions." >&2
    bash "$SCRIPT_DIR/notify-backup-failure.sh" "$TIMESTAMP" "$REASON" "$REPO_URL" || true
    exit $FORCE_EXIT
  fi
else
  REASON="git push exited with code $PUSH_EXIT — check GITHUB_TOKEN or repo access"
  write_status "FAILED" "$REASON"
  echo "$PUSH_OUTPUT" >&2
  echo "ERROR: Push failed (exit $PUSH_EXIT). Check GITHUB_TOKEN or repo permissions." >&2
  bash "$SCRIPT_DIR/notify-backup-failure.sh" "$TIMESTAMP" "$REASON" "$REPO_URL" || true
  exit $PUSH_EXIT
fi
