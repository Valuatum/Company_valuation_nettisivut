import type { Metadata } from 'next'
import { ExpertApp } from '@/expert/ExpertApp'

export const metadata: Metadata = {
  title: 'Asiantuntijakäyttö',
  robots: { index: false, follow: false },
}

export default function AsiantuntijaPage() {
  return <ExpertApp />
}
