import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { Profile, Vouch } from '@/types'
import Stars from '@/components/Stars'
import PrintButton from './PrintButton'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `${slug} — PDF Profile` }
}

export default async function PrintPage({ params }: Props) {
  const { slug } = await params
  const { userId } = await auth()

  const db = createServiceClient()

  const { data: profileData } = await db
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!profileData) notFound()

  const profile = profileData as Profile

  // Only the profile owner (who must have Pro) can access the print view
  if (!userId || profile.user_id !== userId) notFound()

  const isPro = profile.plan === 'pro' || profile.recruiter_active
  if (!isPro) notFound()

  const { data: vouchData } = await db
    .from('vouches')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const vouches = (vouchData ?? []) as Vouch[]
  const trustScore =
    vouches.length > 0
      ? Math.round((vouches.reduce((s, v) => s + v.star_rating, 0) / vouches.length) * 10) / 10
      : 0
  const verificationRate =
    vouches.length > 0
      ? Math.round((vouches.filter((v) => v.verified).length / vouches.length) * 100)
      : 0

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'
  const profileUrl = `${appUrl}/${profile.slug}`
  const initials = profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Manrope', sans-serif;
          font-size: 10pt;
          color: #1b4332;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page { max-width: 720px; margin: 0 auto; padding: 2.5rem 2rem; }

        .header { display: flex; align-items: flex-start; gap: 1.25rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 2px solid #2d6a4f; }

        .avatar { width: 64px; height: 64px; border-radius: 50%; background: #2d6a4f; display: flex; align-items: center; justify-content: center; font-family: 'Libre Baskerville', serif; font-style: italic; font-weight: 700; font-size: 1.2rem; color: #fff; flex-shrink: 0; overflow: hidden; }

        .avatar img { width: 100%; height: 100%; object-fit: cover; }

        .name { font-family: 'Libre Baskerville', serif; font-size: 18pt; font-weight: 700; color: #1b4332; line-height: 1.15; margin-bottom: .2rem; }

        .title { font-size: 10pt; color: #52705c; margin-bottom: .4rem; }

        .meta { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 8.5pt; color: #52705c; }

        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; margin-bottom: 1.25rem; }

        .stat { background: #f5f7f5; border: 1px solid #b7dfc6; border-radius: 6px; padding: .65rem .85rem; }

        .stat-value { font-family: 'Libre Baskerville', serif; font-size: 16pt; font-weight: 700; color: #2d6a4f; line-height: 1; margin-bottom: .15rem; }

        .stat-label { font-size: 7pt; color: #52705c; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; }

        .bio { font-size: 9.5pt; line-height: 1.65; color: #2d6a4f; margin-bottom: 1.25rem; padding: .85rem 1rem; background: #f5f7f5; border-radius: 6px; border-left: 3px solid #2d6a4f; }

        .section-title { font-size: 7pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #52705c; margin-bottom: .75rem; }

        .vouch { border: 1px solid #b7dfc6; border-radius: 8px; padding: .9rem 1rem; margin-bottom: .65rem; break-inside: avoid; }

        .vouch-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .35rem; }

        .vouch-name { font-weight: 700; font-size: 9.5pt; color: #1b4332; }

        .vouch-role { font-size: 8pt; color: #52705c; margin-bottom: .35rem; }

        .vouch-quote { font-size: 9pt; color: #2d6a4f; line-height: 1.55; font-style: italic; margin-bottom: .5rem; }

        .traits { display: flex; flex-wrap: wrap; gap: .3rem; }

        .trait { background: #d8f3dc; color: #1b4332; font-size: 7pt; font-weight: 600; padding: 2px 7px; border-radius: 100px; }

        .verified-badge { font-size: 7pt; font-weight: 700; color: #2d6a4f; background: #d8f3dc; border: 1px solid #95d5b2; border-radius: 100px; padding: 2px 7px; white-space: nowrap; }

        .footer { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #b7dfc6; display: flex; justify-content: space-between; align-items: center; font-size: 7.5pt; color: #52705c; }

        .rn-brand { font-family: 'Libre Baskerville', serif; font-style: italic; font-size: 9pt; color: #1b4332; }

        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          @page { margin: 15mm; }
        }
      `}</style>

      {/* Print trigger button — hidden when printing */}
      <div className="no-print" style={{ background: '#1b4332', padding: '.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: '"Libre Baskerville", serif', fontStyle: 'italic', fontSize: '.95rem', color: 'rgba(255,255,255,.6)' }}>
          Recomme<span style={{ color: 'rgba(255,255,255,.9)' }}>Now</span>
        </span>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)' }}>Use Ctrl+P / ⌘+P to save as PDF</span>
          <PrintButton />
        </div>
      </div>

      <div className="page">
        {/* Header */}
        <div className="header">
          <div className="avatar">
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.name} />
              : initials}
          </div>
          <div style={{ flex: 1 }}>
            <div className="name">{profile.name}</div>
            {profile.title && <div className="title">{profile.title}</div>}
            <div className="meta">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.years_experience && <span>{profile.years_experience} yrs experience</span>}
              {profile.remote_preference && <span>{profile.remote_preference}</span>}
              {profile.availability && <span>Available: {profile.availability}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '7pt', color: '#52705c', marginBottom: '.2rem' }}>Verified profile</div>
            <div style={{ fontSize: '8pt', color: '#2d6a4f', fontWeight: 600 }}>{profileUrl}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat">
            <div className="stat-value">{trustScore > 0 ? `${trustScore}/5` : '—'}</div>
            <div className="stat-label">Trust score</div>
          </div>
          <div className="stat">
            <div className="stat-value">{vouches.length}</div>
            <div className="stat-label">Approved vouches</div>
          </div>
          <div className="stat">
            <div className="stat-value">{verificationRate}%</div>
            <div className="stat-label">Email-verified</div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && <div className="bio">{profile.bio}</div>}

        {/* Industries */}
        {profile.industries?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="section-title">Industries</div>
            <div className="traits">
              {profile.industries.map((ind: string) => (
                <span key={ind} className="trait">{ind}</span>
              ))}
            </div>
          </div>
        )}

        {/* Vouches — up to 6 to fit on one page */}
        {vouches.length > 0 && (
          <div>
            <div className="section-title">Vouches ({vouches.length} total — showing top {Math.min(vouches.length, 6)})</div>
            {vouches.slice(0, 6).map((v) => (
              <div key={v.id} className="vouch">
                <div className="vouch-header">
                  <div>
                    <div className="vouch-name">{v.giver_name}</div>
                    <div className="vouch-role">
                      {[v.giver_title, v.giver_company].filter(Boolean).join(' · ')}
                      {v.giver_relationship && ` · ${v.giver_relationship}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <Stars rating={v.star_rating} size={10} />
                    {v.verified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                </div>
                {v.quote && <div className="vouch-quote">"{v.quote}"</div>}
                {v.traits?.length > 0 && (
                  <div className="traits">
                    {v.traits.map((t: string) => <span key={t} className="trait">{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <span className="rn-brand">Recomme<span style={{ color: '#2d6a4f' }}>Now</span></span>
          <span>All vouches email-verified · {profileUrl}</span>
          <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </>
  )
}
