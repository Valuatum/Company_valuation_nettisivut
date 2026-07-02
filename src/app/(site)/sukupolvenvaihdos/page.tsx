import type { Metadata } from 'next'
import { ContentPage } from '@/components/ContentPage'
import { sukupolvenvaihdosPage as page } from '@/content/pages/sukupolvenvaihdos'

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.metaDescription,
  alternates: { canonical: '/sukupolvenvaihdos' },
  openGraph: { title: page.seoTitle, description: page.metaDescription, type: 'article' },
}

export default function SukupolvenvaihdosPage() {
  return <ContentPage page={page} />
}
