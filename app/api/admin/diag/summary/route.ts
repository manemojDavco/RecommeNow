import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase-server'

// Admin diagnostic for the directory vouch summary.
// Tells us, in one call, whether the model key is configured and whether the
// cache columns exist — so we don't have to guess why summaries are missing.
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createServiceClient()

  const anthropic_key_present = !!process.env.ANTHROPIC_API_KEY

  // Do the cache columns exist?
  const { error: colErr } = await db.from('profiles').select('vouch_summary, vouch_summary_key').limit(1)
  const cache_columns_present = !colErr
  const cache_columns_error = colErr?.message ?? null

  // Can we actually reach the model?
  let model_call_ok: boolean | null = null
  let model_error: string | null = null
  if (anthropic_key_present) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const m = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
      })
      const block = m.content[0]
      model_call_ok = block?.type === 'text' && block.text.toLowerCase().includes('ok')
    } catch (e) {
      model_call_ok = false
      model_error = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json({
    anthropic_key_present,
    model_call_ok,
    model_error,
    cache_columns_present,
    cache_columns_error,
    fix: !anthropic_key_present
      ? 'Add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables, then redeploy.'
      : !cache_columns_present
        ? 'Run supabase/migration-vouch-summary.sql.'
        : model_call_ok === false
          ? 'Model call failed — see model_error.'
          : 'All good — summaries should generate on next directory load.',
  })
}
