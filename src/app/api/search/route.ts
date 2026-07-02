import { NextResponse } from 'next/server'
import { searchCompanies } from '@/lib/companies'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 8, 1), 20)

  if (q.trim().length < 2) {
    return NextResponse.json({ companies: [] })
  }

  try {
    const companies = await searchCompanies(q, limit)
    return NextResponse.json({ companies })
  } catch (err) {
    console.error('search failed', err)
    return NextResponse.json(
      { companies: [], error: 'Haku ei ole juuri nyt käytettävissä' },
      { status: 502 }
    )
  }
}
