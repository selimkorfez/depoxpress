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
  // Honeypot: real visitors never see this field
  if (typeof body.companyUrl === 'string' && body.companyUrl.trim()) return NextResponse.json({ ok: true })
  if (rateLimited(clientIp(req))) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })

  const { data, errors } = clean(body, {
    firstName: { required: true, max: 80 },
    lastName: { required: true, max: 80 },
    companyName: { required: true, max: 120 },
    email: { required: true, email: true, max: 160 },
    telephone: { max: 40 },
    website: { max: 200 },
    country: { max: 80 },
    monthlyOrders: { required: true, max: 40 },
    skuCount: { max: 40 },
    avgItemsPerOrder: { max: 20 },
    storageRequirement: { max: 60 },
    salesChannels: { list: true, max: 200 },
    avgParcelWeight: { max: 40 },
    parcelSize: { max: 60 },
    deliverySpeed: { max: 60 },
    fbaSupport: { max: 10 },
    returnsHandling: { max: 10 },
    message: { max: 4000 },
    hearAboutUs: { max: 60 },
    consent: { required: true, max: 5 },
    locale: { max: 5 },
  })
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 422 })

  const ok = await deliver({
    subject: `Quote request — ${data.companyName} (${data.monthlyOrders} orders/month)`,
    replyTo: data.email,
    rows: [
      ['Name', `${data.firstName} ${data.lastName}`],
      ['Company', data.companyName],
      ['Email', data.email],
      ['Telephone', data.telephone],
      ['Website', data.website],
      ['Country', data.country],
      ['Monthly orders', data.monthlyOrders],
      ['Number of SKUs', data.skuCount],
      ['Average items per order', data.avgItemsPerOrder],
      ['Storage requirement', data.storageRequirement],
      ['Sales channels', data.salesChannels],
      ['Average parcel weight', data.avgParcelWeight],
      ['Typical parcel size', data.parcelSize],
      ['Preferred delivery service', data.deliverySpeed],
      ['Amazon FBA prep support', data.fbaSupport],
      ['UK returns handling', data.returnsHandling],
      ['Message', data.message],
      ['Heard about us via', data.hearAboutUs],
      ['Language', data.locale === 'tr' ? 'Turkish' : 'English'],
      ['Consent to process details', 'Yes'],
    ],
  })
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false, error: 'Could not send' }, { status: 502 })
}
