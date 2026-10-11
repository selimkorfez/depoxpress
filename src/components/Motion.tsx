'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion, MotionConfig, useInView, type HTMLMotionProps } from 'motion/react'
import { usePathname } from 'next/navigation'

/** Every Motion animation respects the visitor's "reduce motion" setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/** Fades + lifts its children into view the first time they scroll on screen. */
export function Reveal({ delay = 0, y = 28, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      {...rest}
    />
  )
}

/** A list whose items stagger in. */
export function RevealList({ className, children, as = 'ul' }: { className?: string; children: React.ReactNode; as?: 'ul' | 'ol' | 'div' }) {
  const Comp = as === 'ol' ? motion.ol : as === 'div' ? motion.div : motion.ul
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      {children}
    </Comp>
  )
}

export function RevealItem({ className, children, as = 'li' }: { className?: string; children: React.ReactNode; as?: 'li' | 'div' }) {
  const Comp = as === 'div' ? motion.div : motion.li
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </Comp>
  )
}

/** Counts up to a number when it scrolls into view. */
export function Counter({ value, prefix = '', suffix = '', locale = 'en-GB' }: { value: number; prefix?: string; suffix?: string; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [n, setN] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctrl = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => ctrl.stop()
  }, [inView, value])

  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString(locale)}
      {suffix ? <small>{suffix}</small> : null}
    </span>
  )
}

/** Fills a bar to a percentage when it scrolls into view. */
export function GrowBar({ to }: { to: number }) {
  return (
    <motion.span
      initial={{ width: '0%' }}
      whileInView={{ width: `${to}%` }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    />
  )
}

/** Header background once scrolled + header height variable. */
export function ScrollFX() {
  const pathname = usePathname()
  useEffect(() => {
    const root = document.documentElement
    let ticking = false
    const update = () => {
      ticking = false
      root.dataset.scrolled = window.scrollY > 30 ? 'true' : 'false'
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])
  return null
}
