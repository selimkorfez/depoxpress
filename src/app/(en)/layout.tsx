import type { Metadata } from 'next'
import { SiteShell } from '@/components/SiteShell'
import { siteUrl } from '@/lib/site'

export { viewport } from '@/lib/metadata'

export const metadata: Metadata = { metadataBase: new URL(siteUrl()) }

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>
}
