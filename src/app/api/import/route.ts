import { NextResponse } from 'next/server'

const MAX_FILES = 10
const MAX_SIZE = 20 * 1024 * 1024 // 20 Mt

// Receives uploaded financial-statement PDFs after checkout.
// ponytail: files are not persisted yet — wiring to storage (and to the
// Valuatum import pipeline) is a follow-up. The order itself is recorded
// separately via postOrder from the client, so the operator sees the upload.
export async function POST(req: Request) {
  const form = await req.formData()
  const files = form.getAll('statements').filter((f): f is File => f instanceof File)

  if (files.length === 0) {
    return NextResponse.json({ error: 'Ei PDF-tiedostoja' }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Enintään ${MAX_FILES} tiedostoa` }, { status: 400 })
  }
  for (const f of files) {
    if (f.type !== 'application/pdf') {
      return NextResponse.json({ error: `Vain PDF-tiedostot kelpaavat: ${f.name}` }, { status: 400 })
    }
    if (f.size > MAX_SIZE) {
      return NextResponse.json({ error: `Tiedosto on yli 20 Mt: ${f.name}` }, { status: 400 })
    }
  }

  console.log('import received', {
    sessionId: form.get('sessionId'),
    company: form.get('company'),
    files: files.map((f) => ({ name: f.name, size: f.size })),
  })

  return NextResponse.json({ ok: true, received: files.length })
}
