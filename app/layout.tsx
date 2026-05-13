import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: "RecommeNow",
    template: '%s · RecommeNow',
  },
  description:
    "Don't just apply. Get vouched. Build a verified reputation profile from real colleagues, managers and clients, and share it anywhere you apply.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'),
  openGraph: {
    siteName: 'RecommeNow',
    type: 'website',
    images: [{ url: '/brand/og-image-default.svg', width: 1200, height: 630, alt: "RecommeNow: Don't just apply. Get vouched." }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/brand/og-image-default.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg',     type: 'image/svg+xml' },
      { url: '/favicon-32.png',  type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png',  type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon-32.png',
    apple:    '/favicon-180.png',
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#2D6A4F' }],
  },
  keywords: ['professional vouching', 'peer recommendations', 'verified references', 'job applications', 'professional reputation'],
  themeColor: '#2D6A4F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head />
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
