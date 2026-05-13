import type { Metadata } from 'next'
import FaqClient from './FaqClient'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'FAQ · RecommeNow',
  description: 'Frequently asked questions about RecommeNow — vouches, verification, privacy, plans and more.',
}

export default function FaqPage() {
  return (
    <>
      <Nav />
      <FaqClient />
    </>
  )
}
