#!/usr/bin/env bash
set -e

STATUS_FILE="$(git rev-parse --show-toplevel)/.github-backup-status"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

write_status() {
  local result="$1"
  local detail="$2"
  printf '%s | %s | %s\n' "$TIMESTAMP" "$result" "$detail" > "$STATUS_FILE"
}

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN secret is not set." >&2
  echo "Add it in the Replit Secrets tab (Settings > Secrets) as a classic PAT with 'repo' scope." >&2
  write_status "FAILED" "GITHUB_TOKEN secret is not set"
  exit 1
fi

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE_URL" != *"Banalhaideri369"* ]]; then
  echo "Fixing remote URL (username typo detected)..."
  git remote set-url origin "https://github.com/Banalhaideri369/Healing-Haven.git"
fi

git config credential.helper '!f() { echo "username=x-access-token"; echo "password=${GITHUB_TOKEN}"; }; f'

echo "Pushing to GitHub..."
if GIT_TERMINAL_PROMPT=0 git push origin main 2>&1; then
  echo "Done. Code is backed up at https://github.com/Banalhaideri369/Healing-Haven"
  write_status "OK" "https://github.com/Banalhaideri369/Healing-Haven"
else
  PUSH_EXIT=$?
  write_status "FAILED" "git push exited with code $PUSH_EXIT — check GITHUB_TOKEN or repo access"
  echo "ERROR: Push failed (exit $PUSH_EXIT). Check GITHUB_TOKEN or repo permissions." >&2
  exit $PUSH_EXIT
fi
