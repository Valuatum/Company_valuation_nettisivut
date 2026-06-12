'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/content/schema'

type Props = {
  site: Pick<SiteSettings, 'name' | 'navLinks' | 'navCta'>
}

export function Header({ site }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || menuOpen
          ? 'bg-forest/95 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.svg" alt="" width={30} height={30} priority />
          <span className="text-[15px] font-medium tracking-tight text-white">
            Valuatum <span className="font-light text-white/70">Arvonmääritys</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Päänavigaatio">
          {site.navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="text-sm font-normal text-white/70 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href={site.navCta.href}
            className="rounded-full bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-deep"
          >
            {site.navCta.label}
          </a>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-white md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Sulje valikko' : 'Avaa valikko'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-forest px-6 pb-6 pt-2 md:hidden" aria-label="Mobiilinavigaatio">
          {site.navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="block border-b border-white/5 py-3.5 text-[15px] text-white/80"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={site.navCta.href}
            className="mt-5 block rounded-full bg-green px-5 py-3 text-center text-[15px] font-medium text-white"
            onClick={() => setMenuOpen(false)}
          >
            {site.navCta.label}
          </a>
        </nav>
      )}
    </header>
  )
}
