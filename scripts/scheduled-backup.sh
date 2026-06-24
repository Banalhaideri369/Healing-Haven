#!/usr/bin/env bash
# Runs push-to-github.sh on a fixed interval.
# Designed to run as a long-lived Replit workflow so it survives container rebuilds.

INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-3600}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[scheduled-backup] Starting. Will push to GitHub every ${INTERVAL_SECONDS}s."

while true; do
  echo "[scheduled-backup] $(date '+%Y-%m-%d %H:%M:%S') — running push-to-github.sh"
  bash "$SCRIPT_DIR/push-to-github.sh" || true
  echo "[scheduled-backup] $(date '+%Y-%m-%d %H:%M:%S') — sleeping ${INTERVAL_SECONDS}s"
  sleep "$INTERVAL_SECONDS"
done
