import { getSiteSettings } from '@/lib/admin'
import ContentClient from './ContentClient'

export default async function ContentPage() {
  const settings = await getSiteSettings()
  return <ContentClient settings={settings} />
}
