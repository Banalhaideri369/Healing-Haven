#!/usr/bin/env bash

STATUS_FILE="$(git rev-parse --show-toplevel)/.github-backup-status"
LOG=/tmp/github-auto-push.log

echo "=== GitHub Backup Status ==="
echo ""

if [ -f "$STATUS_FILE" ]; then
  STATUS_LINE=$(cat "$STATUS_FILE")
  IFS='|' read -r _ts RESULT _detail <<< "$STATUS_LINE"
  RESULT="${RESULT// /}"
  if [[ "$RESULT" == "FAILED" ]]; then
    echo "  LAST PUSH: *** FAILED ***"
    echo "  $STATUS_LINE"
    echo ""
    echo "  ACTION NEEDED: Check your GITHUB_TOKEN secret (Settings > Secrets)"
    echo "  and verify the repo at https://github.com/Banalhaideri369/Healing-Haven"
  elif [[ "$RESULT" == "OK" ]]; then
    echo "  LAST PUSH: OK"
    echo "  $STATUS_LINE"
  else
    echo "  LAST PUSH: $STATUS_LINE"
  fi
else
  echo "  No backup has run yet (status file not found)."
  echo "  Run: bash scripts/push-to-github.sh"
fi

echo ""
echo "=== Recent Push Log (/tmp/github-auto-push.log) ==="
echo ""

if [ -f "$LOG" ]; then
  tail -40 "$LOG"
else
  echo "  Log file not found — it may have been cleared by a container restart."
  echo "  The persistent status above is the best record of the last push attempt."
fi

echo ""
echo "  (This check runs every 30 s. Ctrl-C to stop.)"
