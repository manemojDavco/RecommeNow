#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# vercel-env-setup.sh
# Sets all environment variables in Vercel for both Production and Preview.
#
# BEFORE RUNNING:
#   1.  npx vercel login
#   2.  npx vercel link      (links this folder to your Vercel project)
#   3.  Fill in every REPLACE_ value below
#   4.  chmod +x scripts/vercel-env-setup.sh && ./scripts/vercel-env-setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ════════════════════════════════════════════════════════════════════════════
# FILL THESE IN BEFORE RUNNING
# ════════════════════════════════════════════════════════════════════════════

# ── PRODUCTION values (live traffic) ────────────────────────────────────────
# Get these from: Clerk dashboard (prod instance), Supabase prod project, Stripe live keys
PROD_CLERK_PK="pk_live_REPLACE"
PROD_CLERK_SK="sk_live_REPLACE"
PROD_SUPABASE_URL="https://REPLACE_PROD_REF.supabase.co"
PROD_SUPABASE_ANON_KEY="REPLACE_PROD_ANON_KEY"
PROD_SUPABASE_SERVICE_ROLE_KEY="REPLACE_PROD_SERVICE_ROLE_KEY"
PROD_STRIPE_SK="sk_live_REPLACE"
PROD_STRIPE_PK="pk_live_REPLACE"
PROD_STRIPE_WEBHOOK="whsec_REPLACE_PROD"
PROD_APP_URL="https://recommenow.com"
PROD_CRON_SECRET="REPLACE_WITH_LONG_RANDOM_SECRET_32CHARS"

# ── PREVIEW values (branch previews — uses dev Supabase + Stripe test) ──────
# Get these from: Clerk dashboard (dev instance), Supabase dev project, Stripe test keys
PREVIEW_CLERK_PK="pk_test_REPLACE"
PREVIEW_CLERK_SK="sk_test_REPLACE"
PREVIEW_SUPABASE_URL="https://REPLACE_DEV_REF.supabase.co"
PREVIEW_SUPABASE_ANON_KEY="REPLACE_DEV_ANON_KEY"
PREVIEW_SUPABASE_SERVICE_ROLE_KEY="REPLACE_DEV_SERVICE_ROLE_KEY"
PREVIEW_STRIPE_SK="sk_test_REPLACE"
PREVIEW_STRIPE_PK="pk_test_REPLACE"
PREVIEW_STRIPE_WEBHOOK="whsec_REPLACE_DEV"
PREVIEW_APP_URL="https://REPLACE_YOUR_VERCEL_PREVIEW_DOMAIN.vercel.app"
PREVIEW_CRON_SECRET="dev_cron_secret_replace"

# ── Shared (same for both environments) ─────────────────────────────────────
RESEND_API_KEY="REPLACE_RESEND_API_KEY"
RESEND_FROM_EMAIL="vouches@recommenow.com"
UPSTASH_URL="REPLACE_UPSTASH_URL"
UPSTASH_TOKEN="REPLACE_UPSTASH_TOKEN"

# ════════════════════════════════════════════════════════════════════════════
# DO NOT EDIT BELOW THIS LINE
# ════════════════════════════════════════════════════════════════════════════

echo "Setting Vercel environment variables..."
echo ""

add_env() {
  local key=$1
  local value=$2
  local envs=$3   # "production", "preview", or "production,preview"

  echo "  → $key [$envs]"
  echo "$value" | npx vercel env add "$key" $envs --force 2>/dev/null || \
    echo "    (already exists — use 'vercel env rm $key $envs' first if you need to update)"
}

echo "── PRODUCTION ────────────────────────────────────────────────"
add_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"   "$PROD_CLERK_PK"                   "production"
add_env "CLERK_SECRET_KEY"                    "$PROD_CLERK_SK"                   "production"
add_env "NEXT_PUBLIC_SUPABASE_URL"            "$PROD_SUPABASE_URL"               "production"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"       "$PROD_SUPABASE_ANON_KEY"          "production"
add_env "SUPABASE_SERVICE_ROLE_KEY"           "$PROD_SUPABASE_SERVICE_ROLE_KEY"  "production"
add_env "STRIPE_SECRET_KEY"                   "$PROD_STRIPE_SK"                  "production"
add_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"  "$PROD_STRIPE_PK"                  "production"
add_env "STRIPE_WEBHOOK_SECRET"               "$PROD_STRIPE_WEBHOOK"             "production"
add_env "NEXT_PUBLIC_APP_URL"                 "$PROD_APP_URL"                    "production"
add_env "CRON_SECRET"                         "$PROD_CRON_SECRET"                "production"

echo ""
echo "── PREVIEW (dev Supabase + Stripe test) ─────────────────────"
add_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"   "$PREVIEW_CLERK_PK"                   "preview"
add_env "CLERK_SECRET_KEY"                    "$PREVIEW_CLERK_SK"                   "preview"
add_env "NEXT_PUBLIC_SUPABASE_URL"            "$PREVIEW_SUPABASE_URL"               "preview"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"       "$PREVIEW_SUPABASE_ANON_KEY"          "preview"
add_env "SUPABASE_SERVICE_ROLE_KEY"           "$PREVIEW_SUPABASE_SERVICE_ROLE_KEY"  "preview"
add_env "STRIPE_SECRET_KEY"                   "$PREVIEW_STRIPE_SK"                  "preview"
add_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"  "$PREVIEW_STRIPE_PK"                  "preview"
add_env "STRIPE_WEBHOOK_SECRET"               "$PREVIEW_STRIPE_WEBHOOK"             "preview"
add_env "NEXT_PUBLIC_APP_URL"                 "$PREVIEW_APP_URL"                    "preview"
add_env "CRON_SECRET"                         "$PREVIEW_CRON_SECRET"                "preview"

echo ""
echo "── SHARED (production + preview) ────────────────────────────"
add_env "RESEND_API_KEY"                      "$RESEND_API_KEY"    "production,preview"
add_env "RESEND_FROM_EMAIL"                   "$RESEND_FROM_EMAIL" "production,preview"
add_env "UPSTASH_REDIS_REST_URL"              "$UPSTASH_URL"       "production,preview"
add_env "UPSTASH_REDIS_REST_TOKEN"            "$UPSTASH_TOKEN"     "production,preview"
add_env "NEXT_PUBLIC_CLERK_SIGN_IN_URL"       "/sign-in"           "production,preview"
add_env "NEXT_PUBLIC_CLERK_SIGN_UP_URL"       "/sign-up"           "production,preview"
add_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" "/dashboard"         "production,preview"
add_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" "/onboarding"        "production,preview"

echo ""
echo "✅ All environment variables set."
echo ""
echo "Next step: npx vercel --prod"
