# Depoxpress UK — website

Next.js (App Router) site for **DEPOXRESS UK LTD**, the UK fulfilment operation in Hinckley, Leicestershire. English at `/`, Turkish at `/tr` (with Turkish URL slugs, same as the previous site).

## What's inside
- **Scroll-driven 3D hero** (`src/components/hero/`) — React Three Fiber scene choreographed by GSAP ScrollTrigger (same technique as Honey & Haven): a parcel is picked, packed, taped and labelled → carried by forklift into a curtain-side lorry → the camera pulls back over the Hinckley yard while the fleet loads → lorries pull away and the view zooms out to a UK map as they reach London, Manchester, Glasgow, Bristol, Leeds, Newcastle and Cardiff.
  - Falls back to a still frame for *reduced motion* and to a photo when WebGL isn't available.
  - `/?scene=0.42` renders a single frozen frame of the story at that point (useful for screenshots/QA).
  - Choreography timings: `scene/world.ts` (`T`, `CAMERA_KEYS`, `PANEL_STARTS`). Coastline data in `hero/ukGeo.ts` (Natural Earth, pre-projected).
- **All pages from depoxpress.co.uk**: services + 8 service pages, solutions, how it works, technology, integrations, locations, pricing (Royal Mail reference tables), about, contact (UK/Germany team switch + map), get a quote, privacy, cookies, terms, legal.
- **Content** lives in `src/content/en.ts` and `src/content/tr.ts` (same shape — TypeScript checks the Turkish file has every key). Company facts (phone, email, addresses, company/VAT/EORI numbers) are in `src/lib/site.ts`.
- **Forms** post to `/api/quote` and `/api/contact` — server-side validation, honeypot, per-IP rate limit, delivered by email via [Resend](https://resend.com).
- Language switcher keeps you on the same page in the other language and sets the functional `NEXT_LOCALE` cookie (as described in the Cookie Policy); `/` redirects to `/tr` for visitors who chose Turkish.
- SEO: per-page titles/descriptions, canonical + `hreflang` alternates, sitemap, robots, Open Graph image, LocalBusiness JSON-LD.

## Environment variables
See `.env.example`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://depoxpress.co.uk` |
| `RESEND_API_KEY` | API key so quote/contact forms are emailed |
| `ENQUIRY_TO` | Inbox for enquiries (default `info@depoxpress.com`) |
| `ENQUIRY_FROM` | Verified sender on your Resend domain |

Without `RESEND_API_KEY` the forms show a friendly error (with email/WhatsApp alternatives) in production.

## Local development
```
npm install
npm run dev
```
Open http://localhost:3000 (English) and http://localhost:3000/tr (Turkish).
