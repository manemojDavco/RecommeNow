#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# backup.sh — Daily pg_dump backup of Supabase databases
#
# Run this script on your BACKUP laptop (or any machine with psql installed).
# It connects directly to Supabase and saves compressed .sql.gz files locally.
#
# SETUP (one-time):
#   1. Install psql:   brew install postgresql
#   2. Fill in the DB URLs below (get from Supabase → Settings → Database)
#   3. Make executable: chmod +x scripts/backup.sh
#   4. Schedule daily:  crontab -e
#      Add:  0 2 * * * /path/to/scripts/backup.sh >> /path/to/backup.log 2>&1
#
# FORMAT of DB_URL:
#   postgresql://postgres:[DB-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── CONFIGURE THESE ──────────────────────────────────────────────────────────
PROD_DB_URL="postgresql://postgres:REPLACE_DB_PASSWORD@db.obmbsgstfdmoqmtzvjfk.supabase.co:5432/postgres"
DEV_DB_URL="postgresql://postgres:REPLACE_DEV_DB_PASSWORD@db.REPLACE_DEV_PROJECT_REF.supabase.co:5432/postgres"
BACKUP_DIR="$HOME/recommenow-backups"
KEEP_DAYS=30   # delete backups older than this many days
# ─────────────────────────────────────────────────────────────────────────────

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
mkdir -p "$BACKUP_DIR/prod" "$BACKUP_DIR/dev"

echo "========================================="
echo " RecommeNow Backup — $TIMESTAMP"
echo "========================================="

# ── PRODUCTION BACKUP ────────────────────────────────────────────────────────
echo ""
echo "▶ Backing up PRODUCTION..."
PROD_FILE="$BACKUP_DIR/prod/prod_$TIMESTAMP.sql.gz"
pg_dump "$PROD_DB_URL" \
  --no-owner \
  --no-acl \
  --format=plain \
  | gzip > "$PROD_FILE"
SIZE=$(du -sh "$PROD_FILE" | cut -f1)
echo "  ✓ Saved: $PROD_FILE ($SIZE)"

# ── DEV BACKUP ───────────────────────────────────────────────────────────────
echo ""
echo "▶ Backing up DEV..."
DEV_FILE="$BACKUP_DIR/dev/dev_$TIMESTAMP.sql.gz"
pg_dump "$DEV_DB_URL" \
  --no-owner \
  --no-acl \
  --format=plain \
  | gzip > "$DEV_FILE"
SIZE=$(du -sh "$DEV_FILE" | cut -f1)
echo "  ✓ Saved: $DEV_FILE ($SIZE)"

# ── CLEANUP OLD BACKUPS ──────────────────────────────────────────────────────
echo ""
echo "▶ Removing backups older than $KEEP_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "  ✓ Cleanup done"

# ── SUMMARY ──────────────────────────────────────────────────────────────────
echo ""
echo "✅ Backup complete — $(date)"
echo "   Location: $BACKUP_DIR"
echo ""
ls -lh "$BACKUP_DIR/prod/" | tail -5
echo ""
