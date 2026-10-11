import 'server-only'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* ---------- very small per-instance rate limiter (5 submissions / 10 min / IP) ---------- */
const hits = new Map<string, number[]>()
export function rateLimited(ip: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > limit
}

export function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

/* ---------- validation ---------- */
type Spec = Record<string, { required?: boolean; max?: number; email?: boolean; list?: boolean }>

export function clean(body: unknown, spec: Spec): { data: Record<string, string>; errors: string[] } {
  const src = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const data: Record<string, string> = {}
  const errors: string[] = []
  for (const [key, rule] of Object.entries(spec)) {
    const raw = src[key]
    let value = ''
    if (rule.list && Array.isArray(raw)) value = raw.map((v) => String(v).trim()).filter(Boolean).slice(0, 12).join(', ')
    else if (typeof raw === 'string') value = raw.trim()
    value = value.slice(0, rule.max ?? 300)
    if (rule.required && !value) errors.push(`${key} is required`)
    if (value && rule.email && !EMAIL.test(value)) errors.push(`${key} is not a valid email`)
    if (value) data[key] = value
  }
  return { data, errors }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/* ---------- delivery ---------- */
export async function deliver({ subject, rows, replyTo }: { subject: string; rows: [string, string | undefined][]; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.ENQUIRY_TO || 'info@depoxpress.com'
  const from = process.env.ENQUIRY_FROM || 'Depoxpress UK website <onboarding@resend.dev>'
  const filled = rows.filter(([, v]) => v)
  const text = filled.map(([k, v]) => `${k}: ${v}`).join('\n')
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${filled
    .map(([k, v]) => `<tr><td style="color:#4a5466;vertical-align:top;white-space:nowrap"><strong>${esc(k)}</strong></td><td>${esc(v!).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>`

  if (!key) {
    // Not configured yet: log a short notice (not the enquiry contents) so it's visible in the host logs.
    console.warn(`[enquiry] RESEND_API_KEY is not set — "${subject}" was not emailed.`)
    return process.env.NODE_ENV !== 'production'
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, html, reply_to: replyTo }),
  })
  if (!res.ok) console.error('[enquiry] email provider error', res.status)
  return res.ok
}
