#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# restore.sh — Restore a backup to a Supabase database
#
# Usage:
#   ./scripts/restore.sh prod ~/recommenow-backups/prod/prod_2026-01-01_02-00-00.sql.gz
#   ./scripts/restore.sh dev  ~/recommenow-backups/dev/dev_2026-01-01_02-00-00.sql.gz
# ─────────────────────────────────────────────────────────────────────────────

set -e

ENV=${1}
BACKUP_FILE=${2}

if [ -z "$ENV" ] || [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 [dev|prod] /path/to/backup.sql.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ "$ENV" = "prod" ]; then
  DB_URL="postgresql://postgres:R3c0mm3N0w042026@db.obmbsgstfdmoqmtzvjfk.supabase.co:5432/postgres"
  echo "⚠️  You are about to RESTORE to PRODUCTION"
elif [ "$ENV" = "dev" ]; then
  DB_URL="postgresql://postgres:R3c0mm3N0w042026@db.efudwefjvieokrasbjbw.supabase.co:5432/postgres"
  echo "🔧 Restoring to DEV"
else
  echo "Usage: $0 [dev|prod] /path/to/backup.sql.gz"
  exit 1
fi

echo "   File: $BACKUP_FILE"
read -p "   Type 'yes' to confirm: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "▶ Restoring from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | psql "$DB_URL" --quiet
echo ""
echo "✅ Restore complete."
