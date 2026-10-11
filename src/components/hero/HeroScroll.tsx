'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { PANEL_STARTS } from './scene/world'
import type { SceneLabels } from './scene/DispatchScene'

gsap.registerPlugin(ScrollTrigger, useGSAP)
// keep tweens time-accurate even if a slow device drops frames while scrolling
gsap.ticker.lagSmoothing(0)

const DispatchScene = dynamic(() => import('./scene/DispatchScene'), { ssr: false })

type Step = { title: string; text: string }

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * The home page opening: a parcel is packed, taped and labelled, carried by
 * forklift into a lorry, and — as the camera pulls back — a fleet of lorries
 * leaves the Hinckley dock for destinations across the UK. GSAP ScrollTrigger
 * drives a 0–1 progress value that the Three.js scene reads every frame.
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
  const progress = useRef(0)
  const [mode, setMode] = useState<'pending' | '3d' | 'still' | 'flat'>('pending')
  const [freezeAt, setFreezeAt] = useState<number | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gl = supportsWebGL()
    // ?scene=0.42 renders a single frozen frame of the story (handy for screenshots)
    const q = new URLSearchParams(window.location.search).get('scene')
    const frozen = q !== null && !Number.isNaN(Number(q)) ? Math.min(1, Math.max(0, Number(q))) : null
    setFreezeAt(frozen)
    setMode(!gl ? 'flat' : reduce && frozen === null ? 'still' : '3d')
  }, [])

  const animated = mode === '3d'
  const words = heading.split(' ')

  useGSAP(
    () => {
      if (mode === 'pending') return
      gsap.from('.hero3d-word > span', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.05, delay: 0.1 })
      gsap.from('.hero3d-panel.is-first .hero3d-after', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'expo.out', delay: 0.6, stagger: 0.08 })
      if (!animated) return

      const panels = gsap.utils.toArray<HTMLElement>('.hero3d-panel')
      const dots = gsap.utils.toArray<HTMLElement>('.hero3d-dot')
      const bar = root.current?.querySelector<HTMLElement>('.hero3d-track-fill')
      let active = 0
      const show = (i: number) => {
        if (i === active) return
        const prev = panels[active]
        const next = panels[i]
        const dir = i > active ? 1 : -1
        gsap.to(prev, { autoAlpha: 0, y: -40 * dir, duration: 0.45, ease: 'power2.in', overwrite: true })
        gsap.fromTo(next, { autoAlpha: 0, y: 40 * dir }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.15, overwrite: true })
        dots.forEach((d, k) => d.toggleAttribute('data-active', k <= i))
        active = i
      }

      if (freezeAt !== null) {
        let i = 0
        while (i < PANEL_STARTS.length - 1 && freezeAt >= PANEL_STARTS[i + 1]) i++
        gsap.set(panels, { autoAlpha: 0 })
        gsap.set(panels[i], { autoAlpha: 1, y: 0 })
        if (i > 0) gsap.set('.hero3d-word > span, .hero3d-after', { clearProps: 'all' })
        dots.forEach((d, k) => d.toggleAttribute('data-active', k <= i))
        if (bar) bar.style.transform = `scaleY(${freezeAt})`
        root.current?.toggleAttribute('data-far', freezeAt > 0.62)
        return
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onToggle: (self) => document.documentElement.toggleAttribute('data-in-hero', self.isActive),
        onUpdate: (self) => {
          progress.current = self.progress
          if (bar) bar.style.transform = `scaleY(${self.progress})`
          let i = 0
          while (i < PANEL_STARTS.length - 1 && self.progress >= PANEL_STARTS[i + 1]) i++
          show(Math.min(i, panels.length - 1))
          root.current?.toggleAttribute('data-far', self.progress > 0.62)
        },
      })
      return () => document.documentElement.removeAttribute('data-in-hero')
    },
    { scope: root, dependencies: [mode, steps.length, freezeAt] },
  )

  return (
    <section ref={root} className="hero3d" data-mode={mode} aria-label={heading}>
      <div className="hero3d-stage">
        <div className="hero3d-canvas" aria-hidden="true">
          {mode === '3d' || mode === 'still' ? (
            <DispatchScene progress={progress} still={mode === 'still' || freezeAt !== null} stillAt={freezeAt ?? undefined} labels={labels} />
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
