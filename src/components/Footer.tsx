import Image from 'next/image'
import Link from 'next/link'
import type { SiteSettings } from '@/content/schema'

type Props = { site: SiteSettings }

export function Footer({ site }: Props) {
  return (
    <footer className="bg-charcoal text-white/60">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="" width={28} height={28} />
              <span className="text-[15px] font-medium tracking-tight text-white">
                Valuatum <span className="font-light text-white/70">Arvonmääritys</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">{site.footerTagline}</p>
          </div>

          <nav aria-label="Alatunnisteen linkit">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Sivusto</h2>
            <ul className="mt-4 space-y-2.5">
              {site.footerLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="text-sm transition-colors duration-200 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">Yhteys</h2>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-4 block text-sm text-green-light transition-colors duration-200 hover:text-white"
            >
              {site.contactEmail}
            </a>
            <p className="mt-5 text-xs leading-relaxed text-white/40">{site.footerDisclaimer}</p>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6 text-xs text-white/35">{site.copyright}</div>
      </div>
    </footer>
  )
}
