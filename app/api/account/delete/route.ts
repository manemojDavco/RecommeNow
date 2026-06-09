// Permanently deletes the signed-in user's account.
// 1. Deletes the profile row from Supabase (cascade removes vouches, etc.)
// 2. Deletes the Clerk user record
// Called from the mobile app Settings screen — requires Bearer token auth.
import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = createServiceClient()

    // Delete the profile row — cascading FK constraints handle related data
    // (vouches, vouch_requests, device_approvals, push_tokens, etc.)
    const { error: dbError } = await db
      .from('profiles')
      .delete()
      .eq('user_id', userId)

    if (dbError) {
      console.error('[/api/account/delete] Supabase delete error:', dbError.message)
      // Continue to Clerk deletion even if the profile row didn't exist
    }

    // Delete the Clerk user — this invalidates all sessions immediately
    const clerk = await clerkClient()
    await clerk.users.deleteUser(userId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e: any) {
    console.error('[/api/account/delete] Unexpected error:', e?.message ?? e)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
