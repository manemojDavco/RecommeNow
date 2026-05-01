import { requireAdmin } from '@/lib/admin'
import AdminShell from './AdminShell'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Admin · RecommeNow' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.ADMIN_ENABLED !== 'true') notFound()
  await requireAdmin()
  return <AdminShell>{children}</AdminShell>
}
