import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

async function checkAdmin() {
  const { userId } = await auth()
  if (!userId) return false
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { comingSoon } = await req.json()
  const token     = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId    = process.env.VERCEL_TEAM_ID

  if (!token || !projectId || !teamId) {
    return NextResponse.json({ error: 'Vercel credentials not configured' }, { status: 500 })
  }

  // Update the COMING_SOON env var
  await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'COMING_SOON', value: comingSoon ? 'true' : 'false', type: 'plain', target: ['production'] }),
  })

  // Trigger redeploy by redeploying the latest deployment
  const deploymentsRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=1&target=production`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const { deployments } = await deploymentsRes.json()
  const latestId = deployments?.[0]?.uid

  if (latestId) {
    await fetch(`https://api.vercel.com/v13/deployments?teamId=${teamId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ deploymentId: latestId, name: 'recommenow', target: 'production' }),
    })
  }

  return NextResponse.json({ ok: true })
}
