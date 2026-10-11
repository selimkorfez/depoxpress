import { NextResponse } from 'next/server'
import { clean, clientIp, deliver, rateLimited } from '@/lib/enquiry'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
  if (typeof body.companyUrl === 'string' && body.companyUrl.trim()) return NextResponse.json({ ok: true })
  if (rateLimited(clientIp(req))) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })

  const { data, errors } = clean(body, {
    name: { required: true, max: 120 },
    email: { required: true, email: true, max: 160 },
    telephone: { max: 40 },
    message: { required: true, max: 4000 },
    consent: { required: true, max: 5 },
    team: { max: 4 },
    locale: { max: 5 },
  })
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 422 })

  const team = data.team === 'de' ? 'Germany' : 'United Kingdom'
  const ok = await deliver({
    subject: `Website enquiry (${team}) — ${data.name}`,
    replyTo: data.email,
    rows: [
      ['Team', team],
      ['Name', data.name],
      ['Email', data.email],
      ['Telephone', data.telephone],
      ['Message', data.message],
      ['Language', data.locale === 'tr' ? 'Turkish' : 'English'],
      ['Consent to process details', 'Yes'],
    ],
  })
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false, error: 'Could not send' }, { status: 502 })
}
