import type { Metadata } from 'next'
import { ContentPage } from '@/components/ContentPage'
import { yrityskauppaPage as page } from '@/content/pages/yrityskauppa'

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.metaDescription,
  alternates: { canonical: '/yrityskauppa' },
  openGraph: { title: page.seoTitle, description: page.metaDescription, type: 'article' },
}

export default function YrityskauppaPage() {
  return <ContentPage page={page} />
}
