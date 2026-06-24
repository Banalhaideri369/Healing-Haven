#!/usr/bin/env bash
# Installs git hooks that are not tracked by the repository.
# Safe to run multiple times (idempotent).
set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

install_post_commit() {
  cat > "$HOOKS_DIR/post-commit" <<'EOF'
#!/usr/bin/env bash
# Auto-installed by scripts/install-hooks.sh — do not edit by hand.
# Backs up the repository to GitHub after every commit.
REPO_ROOT="$(git rev-parse --show-toplevel)"
nohup bash "$REPO_ROOT/scripts/push-to-github.sh" \
  >> /tmp/github-auto-push.log 2>&1 &
EOF
  chmod +x "$HOOKS_DIR/post-commit"
  echo "Installed .git/hooks/post-commit"
}

install_post_commit
echo "All hooks installed."
