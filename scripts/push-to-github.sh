#!/usr/bin/env bash
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN secret is not set." >&2
  echo "Add it in the Replit Secrets tab (Settings > Secrets) as a classic PAT with 'repo' scope." >&2
  exit 1
fi

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE_URL" != *"Banalhaideri369"* ]]; then
  echo "Fixing remote URL (username typo detected)..."
  git remote set-url origin "https://github.com/Banalhaideri369/Healing-Haven.git"
fi

git config credential.helper '!f() { echo "username=x-access-token"; echo "password=${GITHUB_TOKEN}"; }; f'

echo "Pushing to GitHub..."
GIT_TERMINAL_PROMPT=0 git push origin main

echo "Done. Code is backed up at https://github.com/Banalhaideri369/Healing-Haven"
