import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())

  if (!adminEmails.includes(email.toLowerCase())) redirect('/dashboard')
  return { userId, email }
}

// Boolean admin check for API routes (no redirect).
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  const db = adminDb()
  const { data } = await db.from('site_settings').select('key, value')
  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value ?? ''
  return map
}

export async function setSiteSetting(key: string, value: string) {
  const db = adminDb()
  await db.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
}
