#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# migrate.sh — Run all SQL migrations against a Supabase project
#
# Usage:
#   ./scripts/migrate.sh dev        (apply to dev Supabase)
#   ./scripts/migrate.sh prod       (apply to production Supabase)
#
# Requirements:
#   brew install postgresql          (for psql)
# ─────────────────────────────────────────────────────────────────────────────

set -e

ENV=${1:-dev}

if [ "$ENV" = "prod" ]; then
  DB_URL="$PROD_DB_URL"
  echo "⚠️  Applying migrations to PRODUCTION"
  read -p "Are you sure? Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
  fi
elif [ "$ENV" = "dev" ]; then
  DB_URL="$DEV_DB_URL"
  echo "🔧 Applying migrations to DEV"
else
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

if [ -z "$DB_URL" ]; then
  echo "❌ DB_URL not set. Export DEV_DB_URL or PROD_DB_URL before running."
  echo ""
  echo "Example:"
  echo "  export DEV_DB_URL='postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres'"
  exit 1
fi

MIGRATIONS=(
  "supabase/schema.sql"
  "supabase/migration-phase2.sql"
  "supabase/migration-phase3.sql"
  "supabase/migration-phase3-recruiter.sql"
)

echo ""
for f in "${MIGRATIONS[@]}"; do
  if [ -f "$f" ]; then
    echo "  ▶ Running $f ..."
    psql "$DB_URL" -f "$f" --quiet
    echo "    ✓ Done"
  else
    echo "  ⚠ Skipping $f (not found)"
  fi
done

echo ""
echo "✅ All migrations applied to $ENV."
