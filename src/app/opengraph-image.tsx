import { ImageResponse } from 'next/og'

export const alt = 'Depoxpress UK — eCommerce fulfilment from Hinckley, Leicestershire'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0d1b2e',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#2457e6', display: 'flex' }} />
          DEPOXPRESS <span style={{ color: '#8fb0ff' }}>UK</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, maxWidth: 980 }}>UK Fulfilment Built for Growing eCommerce Brands</div>
          <div style={{ fontSize: 30, color: '#b6c1d4' }}>Storage · Pick &amp; pack · Amazon FBA prep · Returns — Hinckley, Leicestershire</div>
        </div>
        <div style={{ display: 'flex', height: 14, background: 'repeating-linear-gradient(135deg, #f2a516 0 22px, #0d1b2e 22px 44px)' }} />
      </div>
    ),
    size,
  )
}
