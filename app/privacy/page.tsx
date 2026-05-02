import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata = { title: 'Privacy Policy — RecommeNow' }

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 740, margin: '0 auto', padding: '8rem 2.5rem 6rem', fontFamily: 'var(--sans)' }}>
        <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Legal</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, color: 'var(--ink)', marginBottom: '.75rem', lineHeight: 1.2 }}>Privacy Policy</h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '3rem' }}>Last updated: 1 May 2025</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '.9rem', lineHeight: 1.75, color: 'var(--ink)' }}>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>1. Who we are</h2>
            <p>RecommeNow (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the platform at recommenow.com. This Privacy Policy explains how we collect, use, and protect your personal data when you use our Service. We are committed to handling your data responsibly and in accordance with applicable data protection law, including the UK GDPR and the Data Protection Act 2018.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>2. Data we collect</h2>
            <p style={{ marginBottom: '.75rem' }}><strong>Account data:</strong> When you create an account, we collect your name, email address, and authentication data via our identity provider (Clerk).</p>
            <p style={{ marginBottom: '.75rem' }}><strong>Profile data:</strong> Information you provide for your public profile, including job title, location, years of experience, work preferences, availability, bio, industries, and a profile photo.</p>
            <p style={{ marginBottom: '.75rem' }}><strong>Vouch data:</strong> When someone submits a vouch for you, we store their name, job title, company, email address, relationship to you, and the content of their vouch.</p>
            <p style={{ marginBottom: '.75rem' }}><strong>Billing data:</strong> We use Stripe to process payments. We store only a Stripe customer ID and subscription ID — we never store your full card details.</p>
            <p><strong>Usage data:</strong> We collect standard server logs including IP addresses, browser type, and pages visited. This data is used for security monitoring and improving the Service.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>3. How we use your data</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              <li>To provide and operate the Service</li>
              <li>To process payments and manage your subscription</li>
              <li>To display your public profile and vouches to other users</li>
              <li>To send transactional emails (vouch requests, approvals, account notifications)</li>
              <li>To prevent fraud, abuse, and violations of our Terms of Use</li>
              <li>To improve and develop the Service</li>
            </ul>
            <p style={{ marginTop: '.75rem' }}>We do not sell your personal data to third parties. We do not use your data for advertising purposes.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>4. Public profiles</h2>
            <p>Your profile page (at recommenow.com/your-slug) is publicly accessible. It displays the information you have chosen to include: your name, title, location, bio, industries, and approved vouches. You control which vouches appear on your profile — pending vouches are never shown publicly.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>5. Third-party services</h2>
            <p style={{ marginBottom: '.75rem' }}>We use the following third-party services to operate the platform:</p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              <li><strong>Clerk</strong> — authentication and account management</li>
              <li><strong>Supabase</strong> — database and file storage</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Vercel</strong> — hosting and infrastructure</li>
            </ul>
            <p style={{ marginTop: '.75rem' }}>Each of these providers operates under their own privacy policy and data processing agreements. We only share data with these providers to the extent necessary to deliver the Service.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>6. Data retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will delete your profile, vouches, and associated data within 30 days. Billing records may be retained for up to 7 years as required by applicable law.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>7. Your rights</h2>
            <p style={{ marginBottom: '.75rem' }}>Under UK/EU data protection law, you have the right to:</p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong> — ask us to correct inaccurate data</li>
              <li><strong>Erasure</strong> — request deletion of your personal data</li>
              <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong>Object</strong> — object to certain processing of your data</li>
              <li><strong>Restriction</strong> — ask us to restrict processing in certain circumstances</li>
            </ul>
            <p style={{ marginTop: '.75rem' }}>To exercise any of these rights, contact us at <a href="mailto:hello@recommenow.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>hello@recommenow.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>8. Cookies</h2>
            <p>We use only essential cookies required to operate the Service (for example, session cookies for authentication). We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>9. Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. All data is transmitted over HTTPS and stored encrypted at rest.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>10. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page. Continued use of the Service after changes take effect constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>11. Contact</h2>
            <p>For privacy-related questions or to exercise your data rights, contact us at <a href="mailto:hello@recommenow.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>hello@recommenow.com</a>.</p>
          </section>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--rule)', display: 'flex', gap: '1.5rem' }}>
          <Link href="/terms" style={{ fontSize: '.8rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Terms of Use →</Link>
          <Link href="/" style={{ fontSize: '.8rem', color: 'var(--muted)', textDecoration: 'none' }}>Back to home</Link>
        </div>
      </main>
    </>
  )
}
