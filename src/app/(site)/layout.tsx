import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getSiteSettings } from '@/content/server'

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = await getSiteSettings()
  return (
    <>
      <Header site={{ name: site.name, navLinks: site.navLinks, navCta: site.navCta }} />
      <main className="flex-1">{children}</main>
      <Footer site={site} />
    </>
  )
}
