import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import { publicVouchCap, LEGACY_FREE_RECEIVED_CAP } from './plans'

// A short (max 2 sentences) summary of the vouches that are PUBLISHED on a
// person's public profile — used on the talent directory card.
//
// It is cached on profiles.vouch_summary and keyed by a fingerprint of the
// published vouch set (profiles.vouch_summary_key). When the user changes which
// vouches are live — approves/hides/reorders one, or a plan change moves the cap
// — the fingerprint changes and the summary is regenerated on next read. Steady
// state costs zero model calls.

type VouchRow = { id: string; profile_id: string; quote: string; giver_relationship: string | null; display_order: number | null; created_at: string }

function capFor(plan: string | null | undefined, freeLegacy: boolean | null | undefined): number {
  return (plan === 'free' && freeLegacy) ? LEGACY_FREE_RECEIVED_CAP : publicVouchCap(plan)
}

// Published vouches, in the same order the public profile shows them.
function publishedFor(all: VouchRow[], cap: number): VouchRow[] {
  return [...all]
    .sort((a, b) => {
      const ao = a.display_order, bo = b.display_order
      if (ao == null && bo == null) return b.created_at.localeCompare(a.created_at)
      if (ao == null) return 1
      if (bo == null) return -1
      if (ao !== bo) return ao - bo
      return b.created_at.localeCompare(a.created_at)
    })
    .slice(0, cap)
}

async function generate(name: string, vouches: VouchRow[]): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY || vouches.length === 0) return null
  const quotes = vouches
    .map((v, i) => `${i + 1}. (${v.giver_relationship ?? 'colleague'}) "${v.quote}"`)
    .join('\n')
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `These are the verified vouches published on ${name}'s professional profile.

${quotes}

Write a summary of what these colleagues say about ${name}, for a recruiter browsing a talent directory.

Rules:
- Maximum 2 sentences. Be concise.
- Third person. Use their first name at most once.
- Only use what the vouches actually say — do not invent skills, titles or achievements.
- Plain professional prose. No quotation marks, no bullet points, no preamble.

Respond with the summary text only.`,
      }],
    })
    const block = message.content[0]
    const text = block?.type === 'text' ? block.text.trim() : ''
    return text || null
  } catch (e) {
    console.error('[vouch-summary] generation failed:', e)
    return null
  }
}

/**
 * Returns a map of profileId → summary for the given profiles, generating and
 * caching any that are missing or stale. Never throws; a profile with no
 * summary simply isn't in the map (callers fall back to a raw quote).
 */
export async function ensureVouchSummaries(
  db: SupabaseClient,
  profileIds: string[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  if (profileIds.length === 0) return out

  try {
    // Base columns only — so a missing cache column can never break this.
    const { data: profiles, error: profErr } = await db
      .from('profiles')
      .select('id, name, plan, free_legacy')
      .in('id', profileIds)
    if (profErr) { console.error('[vouch-summary] profile fetch failed:', profErr.message); return out }
    if (!profiles?.length) return out

    // Cache columns are optional (added by migration-vouch-summary.sql). If they
    // aren't there yet we still generate — we just can't persist the result.
    let cacheOk = true
    const cache = new Map<string, { summary: string | null; key: string | null }>()
    const { data: cached, error: cacheErr } = await db
      .from('profiles')
      .select('id, vouch_summary, vouch_summary_key')
      .in('id', profileIds)
    if (cacheErr) {
      cacheOk = false
      console.error('[vouch-summary] cache columns unavailable (run migration-vouch-summary.sql):', cacheErr.message)
    } else {
      for (const c of cached ?? []) cache.set(c.id, { summary: c.vouch_summary, key: c.vouch_summary_key })
    }

    const { data: vouches } = await db
      .from('vouches')
      .select('id, profile_id, quote, giver_relationship, display_order, created_at')
      .in('profile_id', profileIds)
      .eq('status', 'approved')

    const byProfile = new Map<string, VouchRow[]>()
    for (const v of (vouches ?? []) as VouchRow[]) {
      const list = byProfile.get(v.profile_id) ?? []
      list.push(v)
      byProfile.set(v.profile_id, list)
    }

    await Promise.all(profiles.map(async (p) => {
      const published = publishedFor(byProfile.get(p.id) ?? [], capFor(p.plan, p.free_legacy))
      if (published.length === 0) return

      const key = published.map(v => v.id).join(',')
      const prev = cache.get(p.id)

      // Cached and still matching the live set → reuse, no model call.
      if (prev?.summary && prev.key === key) {
        out[p.id] = prev.summary
        return
      }

      const summary = await generate(p.name, published)
      if (!summary) {
        if (prev?.summary) out[p.id] = prev.summary // keep the old one rather than nothing
        return
      }
      out[p.id] = summary

      if (cacheOk) {
        const { error: upErr } = await db.from('profiles')
          .update({ vouch_summary: summary, vouch_summary_key: key })
          .eq('id', p.id)
        if (upErr) console.error('[vouch-summary] cache write failed:', upErr.message)
      }
    }))
  } catch (e) {
    console.error('[vouch-summary] ensure failed:', e)
  }
  return out
}
