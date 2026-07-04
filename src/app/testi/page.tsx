import type { Metadata } from 'next'
import { ExpertApp } from '@/expert/ExpertApp'

export const metadata: Metadata = {
  title: 'Testi',
  robots: { index: false, follow: false },
}

export default function TestiPage() {
  return <ExpertApp />
}
