import * as THREE from 'three'
import { BRAND } from './world'

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

const cache = new Map<string, THREE.CanvasTexture>()

/** Creates (once) a canvas texture. */
export function canvasTexture(key: string, w: number, h: number, draw: Draw, repeat?: [number, number]) {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(...repeat)
  }
  cache.set(key, tex)
  return tex
}

// deterministic noise so textures look the same on every visit
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, rgb: string, alpha: number, seed = 7) {
  const r = rng(seed)
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(${rgb},${r() * alpha})`
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 1.2)
  }
}

/** Corrugated kraft board. */
export const kraftTexture = () =>
  canvasTexture('kraft', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = BRAND.kraft
    ctx.fillRect(0, 0, w, h)
    // faint flute lines
    for (let y = 0; y < h; y += 6) {
      ctx.fillStyle = 'rgba(120,80,40,0.06)'
      ctx.fillRect(0, y, w, 2)
    }
    grain(ctx, w, h, 2600, '90,55,25', 0.12)
    grain(ctx, w, h, 900, '255,240,210', 0.12, 11)
  })

/** A stack of cartons on a pallet: rows of boxes with seams and the odd label. */
export const cartonStackTexture = () =>
  canvasTexture('stack', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = BRAND.kraft
    ctx.fillRect(0, 0, w, h)
    grain(ctx, w, h, 2400, '90,55,25', 0.12)
    const r = rng(3)
    const rows = 3
    const rh = h / rows
    for (let i = 0; i < rows; i++) {
      const cols = 2
      const offset = i % 2 ? w / 4 : 0
      for (let j = -1; j <= cols; j++) {
        const x = offset + (j * w) / cols
        ctx.fillStyle = 'rgba(80,50,20,0.35)'
        ctx.fillRect(x, i * rh, 3, rh)
        // tape strip
        ctx.fillStyle = 'rgba(217,185,139,0.9)'
        ctx.fillRect(x + w / cols / 2 - 6, i * rh, 12, rh * 0.18)
        if (r() > 0.55) {
          ctx.fillStyle = '#fbfaf6'
          ctx.fillRect(x + 18, i * rh + rh * 0.45, 46, 30)
          ctx.fillStyle = BRAND.ink
          for (let k = 0; k < 9; k++) ctx.fillRect(x + 22 + k * 4.5, i * rh + rh * 0.45 + 16, r() > 0.5 ? 2 : 1, 11)
        }
      }
      ctx.fillStyle = 'rgba(80,50,20,0.4)'
      ctx.fillRect(0, i * rh, w, 3)
    }
    // stretch wrap sheen
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, 'rgba(255,255,255,0.12)')
    g.addColorStop(0.5, 'rgba(255,255,255,0)')
    g.addColorStop(1, 'rgba(255,255,255,0.1)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })

/** The shipping label slapped onto the hero parcel. */
export const labelTexture = () =>
  canvasTexture('label', 512, 340, (ctx, w, h) => {
    ctx.fillStyle = '#fdfcf8'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = BRAND.ink
    ctx.lineWidth = 6
    ctx.strokeRect(8, 8, w - 16, h - 16)
    ctx.fillStyle = BRAND.ink
    ctx.font = '800 44px Arial, sans-serif'
    ctx.fillText('DEPOXPRESS', 32, 70)
    ctx.fillStyle = BRAND.signal
    ctx.fillText('UK', 312, 70)
    ctx.fillStyle = BRAND.ink
    ctx.fillRect(24, 92, w - 48, 4)
    ctx.font = '700 30px Arial, sans-serif'
    ctx.fillText('TRACKED 24', 32, 136)
    ctx.font = '500 22px Arial, sans-serif'
    ctx.fillText('HINCKLEY  LE10  →  UK', 32, 170)
    // barcode
    const r = rng(42)
    let x = 32
    while (x < w - 40) {
      const bw = r() > 0.6 ? 6 : r() > 0.3 ? 3 : 2
      ctx.fillRect(x, 196, bw, 92)
      x += bw + (r() > 0.5 ? 4 : 2)
    }
    ctx.font = '500 18px "Courier New", monospace'
    ctx.fillText('DX 4471 0926 3GB', 150, 316)
  })

/** Warehouse floor: polished concrete with yellow walkway lines. */
export const floorTexture = () =>
  canvasTexture(
    'floor',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = BRAND.concrete
      ctx.fillRect(0, 0, w, h)
      grain(ctx, w, h, 5000, '90,90,90', 0.08)
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'
      ctx.lineWidth = 2
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath()
        ctx.moveTo((i * w) / 4, 0)
        ctx.lineTo((i * w) / 4, h)
        ctx.moveTo(0, (i * h) / 4)
        ctx.lineTo(w, (i * h) / 4)
        ctx.stroke()
      }
    },
    [12, 9],
  )

export const asphaltTexture = () =>
  canvasTexture(
    'asphalt',
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = BRAND.asphalt
      ctx.fillRect(0, 0, w, h)
      grain(ctx, w, h, 6000, '20,20,20', 0.25)
      grain(ctx, w, h, 2500, '200,200,200', 0.08, 5)
    },
    [24, 24],
  )

/** Trailer curtain: white with a signal-blue stripe. */
export const curtainTexture = () =>
  canvasTexture('curtain', 512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, w, h)
    for (let x = 0; x < w; x += 16) {
      ctx.fillStyle = 'rgba(0,0,0,0.035)'
      ctx.fillRect(x, 0, 6, h)
    }
    ctx.fillStyle = BRAND.signal
    ctx.fillRect(0, h * 0.7, w, h * 0.09)
    ctx.fillStyle = BRAND.navy
    ctx.fillRect(0, h * 0.82, w, h * 0.04)
  })

/** Soft round shadow used under vehicles (cheap stand-in for real shadows). */
export const blobTexture = () =>
  canvasTexture('blob', 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(0.6, 'rgba(0,0,0,0.25)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })

/** Yard markings drawn once over the asphalt (bay lines, arrows). */
export const productTexture = (color: string, accent: string, key: string) =>
  canvasTexture(`prod-${key}`, 128, 128, (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = accent
    ctx.fillRect(0, h * 0.62, w, h * 0.12)
    ctx.beginPath()
    ctx.arc(w * 0.5, h * 0.34, w * 0.14, 0, Math.PI * 2)
    ctx.fill()
  })
