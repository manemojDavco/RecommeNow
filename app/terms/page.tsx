import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata = { title: 'Terms of Use — RecommeNow' }

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 740, margin: '0 auto', padding: '8rem 2.5rem 6rem', fontFamily: 'var(--sans)' }}>
        <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Legal</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, color: 'var(--ink)', marginBottom: '.75rem', lineHeight: 1.2 }}>Terms of Use</h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '3rem' }}>Last updated: 1 May 2025</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '.9rem', lineHeight: 1.75, color: 'var(--ink)' }}>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>1. Acceptance of terms</h2>
            <p>By accessing or using RecommeNow (&quot;the Service&quot;), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use the Service. These terms apply to all visitors, registered users, and anyone who accesses or uses the Service.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>2. Description of service</h2>
            <p>RecommeNow is a professional reputation platform that allows individuals (&quot;Candidates&quot;) to collect, manage, and share verified professional vouches from colleagues, managers, and clients. Recruiters and hiring managers (&quot;Recruiters&quot;) may access a directory of Candidate profiles. We offer free and paid subscription plans with different feature sets.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>3. Account registration</h2>
            <p>You must create an account to use most features of the Service. You agree to provide accurate, complete, and current information and to keep it up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must be at least 18 years old to use the Service.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>4. Vouches and user content</h2>
            <p style={{ marginBottom: '.75rem' }}>When you submit a vouch or any other content to the Service, you grant RecommeNow a non-exclusive, worldwide, royalty-free licence to display, store, and distribute that content as part of operating the Service.</p>
            <p style={{ marginBottom: '.75rem' }}>You represent that all content you submit is truthful, accurate, and does not infringe on any third-party rights. You agree not to submit content that is:</p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              <li>False, misleading, or defamatory</li>
              <li>Harassing, threatening, or abusive</li>
              <li>In violation of any applicable law or regulation</li>
              <li>Spam, unsolicited advertising, or promotional material</li>
            </ul>
            <p style={{ marginTop: '.75rem' }}>RecommeNow reserves the right to remove any content that violates these terms or that we determine is otherwise inappropriate, without prior notice.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>5. Subscriptions and billing</h2>
            <p style={{ marginBottom: '.75rem' }}>Paid plans are billed monthly in advance. Prices are listed on our pricing page and may change with 30 days&apos; notice. All payments are processed securely by Stripe.</p>
            <p style={{ marginBottom: '.75rem' }}><strong>Cancellation:</strong> You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period — you retain full access until that date and will not be charged again.</p>
            <p>We do not offer refunds for partial billing periods.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>6. Prohibited uses</h2>
            <p style={{ marginBottom: '.75rem' }}>You agree not to use the Service to:</p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              <li>Scrape, harvest, or systematically collect data from the Service</li>
              <li>Impersonate any person or entity</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Use the Service for any unlawful purpose or in violation of any applicable law</li>
              <li>Transmit viruses, malware, or any other harmful code</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>7. Intellectual property</h2>
            <p>The Service, including its design, software, and branding, is owned by RecommeNow and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the Service without our express written permission.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>8. Disclaimer of warranties</h2>
            <p>The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We make no warranty regarding the accuracy, reliability, or completeness of any content on the Service.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>9. Limitation of liability</h2>
            <p>To the fullest extent permitted by law, RecommeNow shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages. Our total liability to you for any claim arising out of these terms or your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in conduct that we determine is harmful to the Service or other users. You may also delete your account at any time by contacting us at the email below.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>11. Changes to these terms</h2>
            <p>We may update these Terms of Use from time to time. We will notify you of material changes by posting the new terms on this page with an updated date. Continued use of the Service after changes take effect constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>12. Governing law</h2>
            <p>These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>13. No guarantee of employment or recruitment outcomes</h2>
            <p style={{ marginBottom: '.75rem' }}>RecommeNow is a professional reputation and reference platform. <strong>We do not guarantee, promise, or imply that use of the Service will result in a job offer, an interview, a hire, or any other employment or business outcome</strong> for any Candidate, Recruiter, or other user.</p>
            <p style={{ marginBottom: '.75rem' }}>Specifically:</p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '.75rem' }}>
              <li><strong>Candidates.</strong> Creating a profile, collecting vouches, or appearing in the Recruiter Directory does not guarantee that any Recruiter will view your profile, contact you, or offer you employment or a contract of any kind.</li>
              <li><strong>Recruiters.</strong> Access to the Candidate Directory and individual profiles does not guarantee that you will find a suitable candidate, successfully hire, or fill any vacancy. We do not vet, screen, verify employment eligibility, or make representations about any Candidate&apos;s suitability for any particular role.</li>
              <li><strong>Vouches.</strong> Vouches displayed on the Service reflect the personal opinions of the individuals who submitted them. RecommeNow does not independently verify the accuracy of vouch content beyond email verification of the submitter&apos;s address. The presence or quality of vouches does not constitute a professional reference, background check, or endorsement by RecommeNow.</li>
            </ul>
            <p>Your use of the Service is entirely at your own risk. RecommeNow is a tool to help you present and discover professional reputation — nothing more. Any employment decisions you make based on information found on the Service are solely your own responsibility.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>14. Algorithmic credibility scores</h2>
            <p style={{ marginBottom: '.75rem' }}>Each vouch displayed on the Service is assigned an automated <strong>Credibility Score</strong> (on a scale of 1.0 to 5.0). This score is calculated entirely by our algorithm based on a set of objective, observable factors including: the stated relationship between the voucher and the Candidate, the length and detail of the vouch text, the number of professional traits selected, whether the submitter used a professional (non-free-provider) email address, and whether the submitter verified their email address by clicking the verification link we send them.</p>
            <p style={{ marginBottom: '.75rem' }}>By using the Service, you acknowledge and agree that:</p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '.75rem' }}>
              <li><strong>Scores are informational only.</strong> Credibility Scores are a convenience signal intended to help viewers quickly assess the relative weight of a vouch. They are not a judgment of a Candidate&apos;s character, ability, or professional worth, and they should not be treated as such.</li>
              <li><strong>No right to a specific score.</strong> No Candidate or vouch submitter has any right to a particular Credibility Score. The algorithm applies the same weighting rules to every vouch consistently; we do not manually adjust scores at a user&apos;s request.</li>
              <li><strong>Scores are not guarantees of accuracy.</strong> The algorithm cannot assess the truthfulness of vouch content, the depth of the professional relationship, or the underlying quality of work described. A high score reflects structural completeness, not factual accuracy.</li>
              <li><strong>No claims arising from scores.</strong> You waive any right to bring a claim against RecommeNow arising from the Credibility Score assigned to any vouch, including but not limited to claims that a score is inaccurate, unfair, too low, or damaging to reputation.</li>
              <li><strong>Scores may change.</strong> We reserve the right to adjust the scoring algorithm at any time. Historical scores may be recalculated when we update the methodology. We will not notify individual users of score changes resulting from algorithm updates.</li>
            </ul>
            <p>If you believe a specific vouch contains false or defamatory content (distinct from the numerical score it received), you may report it to us at <a href="mailto:legal@recommenow.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>legal@recommenow.com</a> and we will review it under our content moderation process.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>15. Service discontinuation</h2>
            <p style={{ marginBottom: '.75rem' }}>We intend to operate RecommeNow for as long as it is viable. However, if we decide to discontinue or permanently shut down the Service, we commit to the following:</p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '.75rem' }}>
              <li><strong>Advance notice.</strong> We will provide at least 30 days&apos; written notice of a planned shutdown by email to all registered users. Where circumstances allow, we will aim to give 60 days&apos; notice so you have adequate time to act.</li>
              <li><strong>Data export.</strong> During the notice period you will be able to export your profile data, vouch history, and any other personal data held by RecommeNow in a machine-readable format (JSON or CSV). Export tools will be available from your account settings until the final shutdown date.</li>
              <li><strong>Pro-rated refunds.</strong> If you hold an active paid subscription (Pro or Recruiter) at the time of a shutdown announcement, we will issue a pro-rated refund for the unused portion of any prepaid billing period. Annual subscribers will receive a refund proportional to the remaining full months of their subscription. Refunds will be processed to the original payment method within 14 days of the announcement.</li>
              <li><strong>Data deletion.</strong> No later than 90 days after the shutdown date, all personal data stored by RecommeNow — including profiles, vouches, and contact information — will be permanently deleted from our servers and any third-party services we use to operate the platform, unless we are required by law to retain it for a longer period.</li>
              <li><strong>Public profile URLs.</strong> After the shutdown date, all public profile URLs will become inactive. We recommend downloading your vouch summary and PDF one-pager before the service ends so you have a permanent record of your professional reputation.</li>
            </ul>
            <p>This section survives any termination or expiry of these Terms. We will always make commercially reasonable efforts to fulfil these commitments, even in cases of unexpected closure.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.6rem' }}>16. Contact</h2>
            <p>For questions about these Terms of Use, please contact us at <a href="mailto:hello@recommenow.com" style={{ color: 'var(--green)', textDecoration: 'none' }}>hello@recommenow.com</a>.</p>
          </section>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--rule)', display: 'flex', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ fontSize: '.8rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy →</Link>
          <Link href="/" style={{ fontSize: '.8rem', color: 'var(--muted)', textDecoration: 'none' }}>Back to home</Link>
        </div>
      </main>
    </>
  )
}
