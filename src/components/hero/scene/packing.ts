import * as THREE from 'three'
import { BOX, T, clamp01, lerp, ramp } from './world'

/* ------------------------------------------------------------------ */
/* Parcel construction + packing motion. Pure functions of progress so  */
/* the scene is identical scrolling forwards or backwards, and so the   */
/* clearances can be checked outside the renderer.                      */
/* ------------------------------------------------------------------ */

/** Cardboard thickness. */
export const T_WALL = 0.008
/** Air between stacked layers of the closed lid, so no two faces ever share a plane. */
export const FLAP_GAP = 0.0015

/* The four flaps are hinged on the OUTER top edges of the walls. In its hinge
   group each flap is modelled lying flat and pointing inwards (angle 0 = closed),
   with its thickness above the hinge line, so a closed flap rests on top of the
   walls instead of overlapping them. Short (end) flaps sit underneath the long ones. */
export const SHORT_HINGE_Y = BOX.h + FLAP_GAP
export const LONG_HINGE_Y = SHORT_HINGE_Y + T_WALL + FLAP_GAP
export const LID_TOP = LONG_HINGE_Y + T_WALL
/** Long flaps meet in the middle with a 2 mm seam (no overlap). */
export const LONG_FLAP = BOX.d / 2 - 0.001
export const LONG_FLAP_SPAN = BOX.w - 0.002
export const SHORT_FLAP = (BOX.d / 2) * 0.9
/** Short flaps start this far in from their crease, so when folded right back they clear the wall top. */
export const SHORT_INSET = 0.006
/** Short flaps fit between the front and back walls. */
export const SHORT_FLAP_SPAN = BOX.d - 2 * T_WALL - 0.004
/** How far each flap is folded back from closed when the box is open (radians). */
export const SHORT_OPEN = 3.62
export const LONG_OPEN = 3.52

/** Flap angles (0 = closed) — the single source of truth for every flap transform. */
export function flapAngles(p: number) {
  return {
    short: SHORT_OPEN * (1 - ramp(p, ...T.flapsShort)),
    long: LONG_OPEN * (1 - ramp(p, ...T.flapsLong)),
  }
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */
export type ItemShape = { kind: 'box'; size: [number, number, number] } | { kind: 'cyl'; r: number; h: number }
export const ITEM_SHAPES: ItemShape[] = [
  { kind: 'box', size: [0.17, 0.11, 0.12] },
  { kind: 'box', size: [0.12, 0.16, 0.09] },
  { kind: 'cyl', r: 0.045, h: 0.19 },
  { kind: 'box', size: [0.2, 0.02, 0.14] }, // tissue sheet, unfolds to TISSUE_SCALE over the products
]
/** Where each product waits on the bench (parcel-local, centre of the item). */
export const ITEM_START: [number, number, number][] = [
  [-0.5, 0.055, 0.12],
  [-0.56, 0.08, -0.12],
  [-0.74, 0.095, 0.06],
  [-0.5, 0.01, -0.29],
]
/** Where each product ends up inside the box (parcel-local). */
export const ITEM_END: [number, number, number][] = [
  [-0.12, 0.065, 0.06],
  [0.13, 0.09, -0.07],
  [0.14, 0.105, 0.09],
  [0, 0.25, 0],
]
const START_YAW = [0, 0, 0, 0.4]
const TISSUE_SCALE: [number, number, number] = [2.1, 1, 2.2]

/** Radius of the sphere that contains the item at any orientation (at its largest scale). */
function itemRadius(i: number) {
  const s = ITEM_SHAPES[i]
  if (s.kind === 'cyl') return Math.hypot(s.r, s.h / 2)
  const sc = i === 3 ? TISSUE_SCALE : [1, 1, 1]
  return Math.hypot((s.size[0] * sc[0]) / 2, (s.size[1] * sc[1]) / 2, (s.size[2] * sc[2]) / 2)
}

/** Highest point of the open box (flap hinges) plus a safety margin. */
export const CLEAR_Y = LID_TOP + 0.04

/** Each item gets its own window; the next one only starts moving sideways once the previous one is packed. */
const PHASE = { liftEnd: 0.36, moveStart: 0.28, moveEnd: 0.72, lowerStart: 0.64 }
const WINDOW = (T.itemsDrop[1] - T.itemsDrop[0]) / (3 * (1 - PHASE.moveStart) + 1)
const STRIDE = WINDOW * (1 - PHASE.moveStart)
export const itemWindow = (i: number): [number, number] => {
  const a = T.itemsDrop[0] + i * STRIDE
  return [a, a + WINDOW]
}

/**
 * Pose of product i at progress p: lift straight up from the bench until it
 * clears the box, carry it across above the opening, then lower it straight
 * down to its packed spot. The three moves overlap only where the item is
 * already clear of the rim and flaps (checked in scripts, see report).
 */
export function itemPose(i: number, p: number, pos: THREE.Vector3, rot: THREE.Euler, scale: THREE.Vector3) {
  const [a, b] = itemWindow(i)
  const k = clamp01((p - a) / (b - a))
  const s = ITEM_START[i]
  const e = ITEM_END[i]
  const safe = CLEAR_Y + itemRadius(i)
  const up = ramp(k, 0, PHASE.liftEnd)
  const across = ramp(k, PHASE.moveStart, PHASE.moveEnd)
  const down = ramp(k, PHASE.lowerStart, 1)
  pos.set(lerp(s[0], e[0], across), lerp(s[1], safe, up) - (safe - e[1]) * down, lerp(s[2], e[2], across))
  // a small turn while carried, fully squared up before it is lowered in
  const swing = Math.sin(across * Math.PI)
  rot.set(0, lerp(START_YAW[i], 0, across) + swing * 0.35, swing * 0.18)
  if (i === 3) scale.set(lerp(1, TISSUE_SCALE[0], across), 1, lerp(1, TISSUE_SCALE[2], across))
  else scale.set(1, 1, 1)
  return k
}
