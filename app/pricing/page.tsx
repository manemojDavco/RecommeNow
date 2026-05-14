import { auth } from '@clerk/nextjs/server'
import PricingClient from './PricingClient'

export const metadata = { title: 'Pricing' }

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ trial?: string }>
}) {
  const { userId } = await auth()
  const params = await searchParams
  const trial = params.trial === '1'
  return <PricingClient isSignedIn={!!userId} trial={trial} />
}
