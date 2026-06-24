#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Re-install git hooks (they live in .git/hooks/ which is not committed).
bash "$(dirname "$0")/install-hooks.sh"
