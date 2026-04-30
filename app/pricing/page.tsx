import { auth } from '@clerk/nextjs/server'
import PricingClient from './PricingClient'

export const metadata = { title: 'Pricing' }

export default async function PricingPage() {
  const { userId } = await auth()
  return <PricingClient isSignedIn={!!userId} />
}
