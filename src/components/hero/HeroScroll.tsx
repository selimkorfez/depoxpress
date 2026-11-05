'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { STAGE_BOUNDS, stageAt, stageIn, stageOut } from './scene/world'
import type { SceneLabels } from './scene/DispatchScene'

gsap.registerPlugin(ScrollTrigger, useGSAP)
// keep tweens time-accurate even if a slow device drops frames while scrolling
gsap.ticker.lagSmoothing(0)
// mobile browsers resize the viewport as the address bar shows/hides — don't re-measure (and jump) on that
ScrollTrigger.config({ ignoreMobileResize: true })

const DispatchScene = dynamic(() => import('./scene/DispatchScene'), { ssr: false })

type Step = { title: string; text: string }
type Mode = 'pending' | '3d' | 'still' | 'flat'

/** How quickly the displayed progress catches up with the scroll position (per second). */
const DAMPING = 9
/** How far a card travels while it hands over, in px. */
const CARD_TRAVEL = 26

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Very low-powered devices (or Data Saver) get the still, non-scrubbed version. */
function prefersLightweight() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  return !!nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (navigator.hardwareConcurrency || 8) <= 2
}

/**
 * The home page opening: a parcel is packed, taped and labelled, carried by
 * forklift into a lorry, and — as the camera pulls back — a fleet of lorries
 * leaves the Hinckley dock for destinations across the UK.
 *
 * One master loop (GSAP's ticker) drives everything: ScrollTrigger supplies the
 * raw scroll progress, the loop damps it by elapsed time, positions the story
 * cards from that value and renders the Three.js frame — so cards and scene can
 * never disagree, and stage boundaries are the same forwards and backwards.
 */
export function HeroScroll({
  eyebrow,
  heading,
  text,
  steps,
  labels,
  fallbackImage,
  fallbackAlt,
  scrollLabel,
  children,
}: {
  eyebrow: string
  heading: string
  text: string
  steps: Step[]
  labels: SceneLabels
  fallbackImage: string
  fallbackAlt: string
  scrollLabel: string
  children: React.ReactNode
}) {
  const root = useRef<HTMLElement>(null)
  /** Displayed (damped) progress — what the scene and cards show. */
  const progress = useRef(0)
  /** Renders one frame of the 3D scene; registered by DispatchScene once it's ready. */
  const renderFrame = useRef<((timestamp: number) => void) | null>(null)
  const [mode, setMode] = useState<Mode>('pending')
  const [freezeAt, setFreezeAt] = useState<number | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gl = supportsWebGL()
    // ?scene=0.42 renders a single frozen frame of the story (handy for screenshots)
    const q = new URLSearchParams(window.location.search).get('scene')
    const frozen = q !== null && !Number.isNaN(Number(q)) ? Math.min(1, Math.max(0, Number(q))) : null
    setFreezeAt(frozen)
    setMode(!gl ? 'flat' : frozen !== null ? '3d' : reduce || prefersLightweight() ? 'still' : '3d')
  }, [])

  const animated = mode === '3d'
  const words = heading.split(' ')

  useGSAP(
    () => {
      if (mode === 'pending') return
      if (mode === '3d' && freezeAt === null) {
        // headline arrival (skipped for reduced motion / still mode)
        gsap.from('.hero3d-word > span', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.05, delay: 0.1 })
        gsap.from('.hero3d-panel.is-first .hero3d-after', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'expo.out', delay: 0.6, stagger: 0.08 })
      }
      if (!animated) return

      const section = root.current!
      const panels = gsap.utils.toArray<HTMLElement>('.hero3d-panel', section)
      const dots = gsap.utils.toArray<HTMLElement>('.hero3d-dot', section)
      const bar = section.querySelector<HTMLElement>('.hero3d-track-fill')
      const vertical = window.matchMedia('(min-width: 901px)')

      // cached style state so we only touch the DOM when something actually changes
      const last = panels.map(() => ({ o: -1, y: NaN, vis: '', pe: '', z: '' }))
      let lastStage = -1
      let lastBar = -1
      let lastFar: boolean | null = null

      const applyCards = (p: number) => {
        const stage = stageAt(p)
        panels.forEach((el, i) => {
          const a = stageIn(i, p)
          const b = stageOut(i, p)
          const o = Math.round(a * (1 - b) * 1000) / 1000
          // arrive from below, leave upwards; perfectly still while resting
          const y = Math.round(((1 - a) * CARD_TRAVEL - b * CARD_TRAVEL) * 10) / 10
          const s = last[i]
          if (o !== s.o) {
            el.style.opacity = String(o)
            s.o = o
          }
          if (y !== s.y) {
            el.style.transform = y === 0 ? 'none' : `translate3d(0, ${y}px, 0)`
            s.y = y
          }
          const vis = o > 0 ? 'visible' : 'hidden'
          if (vis !== s.vis) {
            el.style.visibility = vis
            s.vis = vis
          }
          const pe = o > 0.6 ? 'auto' : 'none'
          if (pe !== s.pe) {
            el.style.pointerEvents = pe
            s.pe = pe
          }
          const z = i === stage ? '2' : '1'
          if (z !== s.z) {
            el.style.zIndex = z
            s.z = z
          }
        })
        if (stage !== lastStage) {
          dots.forEach((d, k) => d.toggleAttribute('data-active', k <= stage))
          lastStage = stage
        }
        const bp = Math.round(p * 1000) / 1000
        if (bar && bp !== lastBar) {
          bar.style.transform = vertical.matches ? `scaleY(${bp})` : `scaleX(${bp})`
          lastBar = bp
        }
        const far = p > STAGE_BOUNDS[3]
        if (far !== lastFar) {
          section.toggleAttribute('data-far', far)
          lastFar = far
        }
      }

      if (freezeAt !== null) {
        progress.current = freezeAt
        applyCards(freezeAt)
        return
      }

      // master scroll timeline: ScrollTrigger only reports where the scroll is
      let target = 0
      let inView = true
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          target = self.progress
        },
        onToggle: (self) => document.documentElement.toggleAttribute('data-in-hero', self.isActive),
      })
      target = st.progress
      progress.current = target
      applyCards(target)

      // render only while the hero is (nearly) on screen
      const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: '120px' })
      io.observe(section.querySelector('.hero3d-stage')!)

      let settled = false
      const tick = (time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 100) / 1000
        const cur = progress.current
        const diff = target - cur
        let next = cur + diff * (1 - Math.exp(-DAMPING * dt))
        if (Math.abs(target - next) < 0.00005) next = target
        const moving = next !== cur
        progress.current = next
        if (moving || !settled) applyCards(next)
        settled = !moving
        if (inView) renderFrame.current?.(time * 1000)
      }
      gsap.ticker.add(tick)

      return () => {
        gsap.ticker.remove(tick)
        io.disconnect()
        st.kill()
        document.documentElement.removeAttribute('data-in-hero')
      }
    },
    { scope: root, dependencies: [mode, steps.length, freezeAt] },
  )

  return (
    <section ref={root} className="hero3d" data-mode={mode} aria-label={heading}>
      <div className="hero3d-stage">
        <div className="hero3d-canvas" aria-hidden="true">
          {mode === '3d' || mode === 'still' ? (
            <DispatchScene
              progress={progress}
              still={mode === 'still' || freezeAt !== null}
              stillAt={freezeAt ?? undefined}
              labels={labels}
              renderFrame={mode === '3d' && freezeAt === null ? renderFrame : undefined}
            />
          ) : mode === 'flat' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero3d-fallback" src={fallbackImage} alt={fallbackAlt} />
          ) : null}
        </div>

        <div className="container hero3d-copy">
          <div className="hero3d-panel is-first">
            <p className="eyebrow hero3d-after">{eyebrow}</p>
            <h1 className="hero3d-title">
              {words.map((w, i) => (
                <span key={i}>
                  <span className="hero3d-word">
                    <span>{w}</span>
                  </span>
                  {i < words.length - 1 ? ' ' : null}
                </span>
              ))}
            </h1>
            <p className="hero3d-text hero3d-after">{text}</p>
            <div className="hero3d-after">{children}</div>
          </div>
          {steps.map((s, i) => (
            <div key={s.title} className="hero3d-panel hero3d-card">
              <p className="hero3d-step-no">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span aria-hidden="true" className="hero3d-step-bar" />
              </p>
              <h2 className="hero3d-step">{s.title}</h2>
              <p className="hero3d-text">{s.text}</p>
            </div>
          ))}
        </div>

        {animated ? (
          <>
            <div className="hero3d-track" aria-hidden="true">
              <span className="hero3d-track-line">
                <span className="hero3d-track-fill" />
              </span>
              {[0, ...steps.map((_, i) => i + 1)].map((i) => (
                <span key={i} className="hero3d-dot" data-active={i === 0 ? '' : undefined} />
              ))}
            </div>
            <div className="hero3d-hint" aria-hidden="true">
              <span>{scrollLabel}</span>
              <span className="hero3d-hint-line" />
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
