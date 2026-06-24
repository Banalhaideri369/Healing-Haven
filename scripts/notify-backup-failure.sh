#!/usr/bin/env bash
# Sends an alert when the GitHub backup push fails.
# Supports Slack (SLACK_WEBHOOK_URL) and/or email via Resend (RESEND_API_KEY + ALERT_EMAIL_TO).
# Call with: notify-backup-failure.sh "<timestamp>" "<reason>" "<repo_url>"

set -euo pipefail

TIMESTAMP="${1:-unknown time}"
REASON="${2:-unknown error}"
REPO_URL="${3:-https://github.com/Banalhaideri369/Healing-Haven}"

NOTIFIED=0

# ── Slack ─────────────────────────────────────────────────────────────────────
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
  PAYLOAD=$(printf '{
  "text": ":rotating_light: *GitHub backup failed*",
  "attachments": [
    {
      "color": "danger",
      "fields": [
        { "title": "Time",   "value": "%s", "short": true },
        { "title": "Reason", "value": "%s", "short": false },
        { "title": "Repo",   "value": "<%s>", "short": false }
      ]
    }
  ]
}' "$TIMESTAMP" "$REASON" "$REPO_URL")

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    --data "$PAYLOAD")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "Alert: Slack notification sent."
    NOTIFIED=1
  else
    echo "Alert: Slack notification failed (HTTP $HTTP_CODE)." >&2
  fi
fi

# ── Email via Resend ───────────────────────────────────────────────────────────
if [ -n "${RESEND_API_KEY:-}" ] && [ -n "${ALERT_EMAIL_TO:-}" ]; then
  ALERT_EMAIL_FROM="${ALERT_EMAIL_FROM:-alerts@updates.healinghaven.app}"

  BODY_HTML=$(printf '<p><strong>Time:</strong> %s</p><p><strong>Reason:</strong> %s</p><p><strong>Repo:</strong> <a href="%s">%s</a></p>' \
    "$TIMESTAMP" "$REASON" "$REPO_URL" "$REPO_URL")

  PAYLOAD=$(printf '{
  "from": "%s",
  "to": ["%s"],
  "subject": "GitHub backup failed — %s",
  "html": "%s"
}' "$ALERT_EMAIL_FROM" "$ALERT_EMAIL_TO" "$TIMESTAMP" "$BODY_HTML")

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "https://api.resend.com/emails" \
    -H "Authorization: Bearer ${RESEND_API_KEY}" \
    -H "Content-Type: application/json" \
    --data "$PAYLOAD")

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "Alert: Email notification sent to ${ALERT_EMAIL_TO}."
    NOTIFIED=1
  else
    echo "Alert: Email notification failed (HTTP $HTTP_CODE)." >&2
  fi
fi

# ── No channels configured ────────────────────────────────────────────────────
if [ "$NOTIFIED" -eq 0 ]; then
  echo "Alert: No notification channels configured." \
       "Set SLACK_WEBHOOK_URL or RESEND_API_KEY + ALERT_EMAIL_TO to enable alerts." >&2
fi
