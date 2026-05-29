'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'rn_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if user hasn't made a choice yet
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-sm">
      <div className="rounded-2xl border border-rule bg-white shadow-lg shadow-ink/10 p-6">
        <button
          onClick={decline}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted hover:text-ink transition-colors text-xl leading-none"
        >
          ×
        </button>

        <p className="text-sm text-ink2 leading-relaxed mb-2">
          This website stores cookies on your computer. These cookies are used to improve your
          website experience and provide more personalised services to you, both on this website
          and through other media. To find out more about the cookies we use, see our{' '}
          <a href="/privacy" className="text-green-2 underline underline-offset-2 hover:text-green">
            Privacy Policy
          </a>
          .
        </p>
        <p className="text-sm text-muted leading-relaxed mb-5">
          We won&apos;t track your information when you visit our site. But in order to comply
          with your preferences, we&apos;ll have to use just one tiny cookie so that you&apos;re
          not asked to make this choice again.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={decline}
            className="px-5 py-2.5 rounded-full border border-green-2 text-green-2 text-sm font-semibold hover:bg-green-l transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2.5 rounded-full bg-green-2 text-white text-sm font-semibold hover:bg-green transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
