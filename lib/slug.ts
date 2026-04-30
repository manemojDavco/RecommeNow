import { nanoid } from 'nanoid'

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
  const suffix = nanoid(4).toLowerCase().replace(/[^a-z0-9]/g, 'x')
  return `${base}-${suffix}`
}
