import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: "RecommeNow — Let the people who've seen your work speak for you",
    template: '%s · RecommeNow',
  },
  description:
    'Verified peer feedback that travels with you. Build a reputation profile from real colleagues, managers and clients — and share it anywhere you apply.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'),
  openGraph: {
    siteName: 'RecommeNow',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
