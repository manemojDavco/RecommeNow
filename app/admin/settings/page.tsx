import { getSiteSettings } from '@/lib/admin'
import SettingsClient from './SettingsClient'
export default async function SettingsPage() {
  const settings = await getSiteSettings()
  return <SettingsClient settings={settings} />
}
