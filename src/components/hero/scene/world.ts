import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/* Units: 1 = 1 metre. Origin = the Hinckley dock door of the hero     */
/* lorry. +x = east, -z = north, y = up. The UK map uses the same      */
/* frame (see ukGeo.ts, generated in km around Hinckley).              */
/* ------------------------------------------------------------------ */

export const BRAND = {
  ink: '#0d1b2e',
  navy: '#14284a',
  signal: '#2457e6',
  kraft: '#c9965f',
  kraftDark: '#a87642',
  tape: '#d9b98b',
  paper: '#f4f1ea',
  concrete: '#d9d6cf',
  asphalt: '#4a4f57',
  land: '#cbd5bf',
  landDark: '#b8c4a8',
  sea: '#16304f',
  amber: '#f2a516',
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** 0 → 1 between a and b, eased (smoothstep). */
export const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** linear 0 → 1 between a and b */
export const lin = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const easeOutBack = (t: number) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
export const easeOutBounce = (t: number) => {
  const n = 7.5625
  const d = 2.75
  if (t < 1 / d) return n * t * t
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}

/** Lat/lon → scene metres (same projection as ukGeo.ts, which is in km). */
const LAT0 = 52.541
const LON0 = -1.373
const KX = 111320 * Math.cos((LAT0 * Math.PI) / 180)
const KZ = 110540
export const ll = (lat: number, lon: number) => new THREE.Vector3((lon - LON0) * KX, 0, -(lat - LAT0) * KZ)

/* ------------------------------------------------------------------ */
/* Site layout                                                         */
/* ------------------------------------------------------------------ */
export const DOCK_H = 1.2 // dock floor / trailer bed height
export const BAY_X = [-24, -16, -8, 0, 8, 16, 24]
export const HERO_BAY = 3 // index of x = 0
export const TRAILER_REAR_Z = 0.35
/** How far lorries pull off the dock before closing their doors. */
export const PULL = 2.6
export const TABLE = new THREE.Vector3(0, DOCK_H, -9.5)
export const TABLE_TOP = 0.92
export const BOX = { w: 0.5, d: 0.36, h: 0.34 }

/** Pallet slots inside a trailer (local to the lorry; rear at z = 0, cab towards +z). */
export const SLOT_ROWS = 10
export const slotLocal = (index: number) => {
  const row = Math.floor(index / 2)
  const col = index % 2
  return new THREE.Vector3(col === 0 ? -0.62 : 0.62, DOCK_H, 13.0 - row * 1.27)
}
export const SLOTS = SLOT_ROWS * 2
/** The slot the forklift fills on the hero lorry (second row from the doors, left side). */
export const HERO_SLOT = 16

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */
export type CityKey = 'london' | 'manchester' | 'glasgow' | 'bristol' | 'leeds' | 'newcastle' | 'cardiff'
export const CITIES: Record<CityKey | 'hinckley', THREE.Vector3> = {
  hinckley: ll(52.541, -1.373),
  london: ll(51.507, -0.128),
  manchester: ll(53.48, -2.242),
  glasgow: ll(55.864, -4.252),
  bristol: ll(51.454, -2.588),
  leeds: ll(53.8, -1.549),
  newcastle: ll(54.978, -1.618),
  cardiff: ll(51.481, -3.179),
}
/** Which city each bay's lorry heads to (west → east). */
export const BAY_CITY: CityKey[] = ['cardiff', 'bristol', 'glasgow', 'london', 'manchester', 'leeds', 'newcastle']

/* ------------------------------------------------------------------ */
/* Timeline (scroll progress 0 → 1)                                    */
/* ------------------------------------------------------------------ */
export const T = {
  itemsDrop: [0.035, 0.12] as const,
  flapsShort: [0.12, 0.155] as const,
  flapsLong: [0.15, 0.19] as const,
  tape: [0.2, 0.275] as const,
  label: [0.28, 0.31] as const,
  boxToPallet: [0.32, 0.37] as const,
  drive: [0.37, 0.47] as const,
  place: [0.47, 0.5] as const,
  reverse: [0.5, 0.55] as const,
  fill: [0.36, 0.6] as const,
  doors: [0.56, 0.62] as const,
  curtains: [0.58, 0.65] as const,
  depart: 0.64,
  departStagger: 0.011,
  arrive: 0.955,
}

/** Story panels switch at these progress values (headline + 4 steps). */
export const PANEL_STARTS = [0, 0.06, 0.2, 0.36, 0.64]

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
export type Route = { curve: THREE.CurvePath<THREE.Vector3>; length: number; yardLength: number; city: CityKey }

export function buildRoute(bay: number): Route {
  const x = BAY_X[bay]
  const city = BAY_CITY[bay]
  const dest = CITIES[city].clone()
  const path = new THREE.CurvePath<THREE.Vector3>()
  // pull straight out of the bay…
  const a = new THREE.Vector3(x, 0, TRAILER_REAR_Z + PULL)
  const b = new THREE.Vector3(x, 0, 30)
  path.add(new THREE.LineCurve3(a, b))
  // …swing onto the access road and head south to the main road
  const road = new THREE.Vector3(0, 0, 120)
  path.add(new THREE.CubicBezierCurve3(b, new THREE.Vector3(x, 0, 62), new THREE.Vector3(0, 0, 60), road))
  const gate = new THREE.Vector3(0, 0, 420)
  path.add(new THREE.LineCurve3(road, gate))
  // long haul: sweep out and away from the site, then arc to the city
  const dir = dest.clone().sub(gate).setY(0).normalize()
  const side = Math.sign(dest.x - gate.x) || 1
  const span = dest.distanceTo(gate)
  const c1 = gate.clone().add(new THREE.Vector3(side * 1400, 0, 1500))
  const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(span * 0.07 * (bay % 2 ? 1 : -1))
  const c2 = gate.clone().lerp(dest, 0.6).add(perp)
  path.add(new THREE.CubicBezierCurve3(gate, c1, c2, dest))
  const lengths = path.getCurveLengths()
  return { curve: path, length: lengths[lengths.length - 1], yardLength: lengths[2], city }
}

/** Main motorways (lat/lon waypoints) drawn faintly on the map for context. */
export const MOTORWAYS: [number, number][][] = [
  // M1: London → Leicester → Sheffield → Leeds
  [[51.58, -0.24], [51.88, -0.42], [52.23, -0.9], [52.4, -1.18], [52.62, -1.2], [52.9, -1.27], [53.2, -1.38], [53.43, -1.38], [53.75, -1.5]],
  // M6 / M74: Rugby → Birmingham → Manchester → Carlisle → Glasgow
  [[52.4, -1.18], [52.47, -1.5], [52.52, -1.9], [52.8, -2.1], [53.2, -2.4], [53.45, -2.6], [54.0, -2.75], [54.6, -2.85], [54.9, -2.95], [55.3, -3.4], [55.8, -4.05], [55.86, -4.25]],
  // M69: Coventry → Hinckley → Leicester
  [[52.43, -1.42], [52.54, -1.37], [52.6, -1.2]],
  // M5: Birmingham → Bristol → Exeter
  [[52.5, -1.98], [52.2, -2.15], [51.86, -2.24], [51.48, -2.6], [51.2, -2.95], [50.72, -3.5]],
  // M4: London → Bristol → Cardiff → Swansea
  [[51.49, -0.3], [51.46, -1.0], [51.53, -1.8], [51.5, -2.5], [51.58, -2.95], [51.52, -3.25], [51.62, -3.95]],
  // M62: Liverpool → Manchester → Leeds → Hull
  [[53.41, -2.9], [53.45, -2.45], [53.6, -2.1], [53.73, -1.7], [53.73, -1.2], [53.74, -0.45]],
  // A1(M): London → Newcastle → Edinburgh
  [[51.68, -0.2], [52.3, -0.25], [52.9, -0.65], [53.4, -1.0], [53.8, -1.35], [54.5, -1.55], [54.97, -1.6], [55.4, -1.75], [55.95, -2.6], [55.94, -3.2]],
  // M40: London → Birmingham
  [[51.6, -0.5], [51.75, -1.05], [52.05, -1.35], [52.3, -1.58], [52.45, -1.75]],
]

/** Distance travelled along a route for a given local time 0..1 — exponential, so the lorry keeps pace with the zooming camera. */
export function travelled(u: number, length: number) {
  if (u <= 0) return 0
  if (u >= 1) return length
  const a = Math.log(length / 4)
  return (length * (Math.exp(a * u) - 1)) / (Math.exp(a) - 1)
}

export const departStart = (bay: number) => {
  // hero leaves first, then neighbours outward
  const order = [3, 2, 4, 1, 5, 0, 6]
  return T.depart + order.indexOf(bay) * T.departStagger
}

/* ------------------------------------------------------------------ */
/* Camera path                                                         */
/* ------------------------------------------------------------------ */
type Key = { p: number; target: [number, number, number]; az: number; el: number; dist: number }
const deg = Math.PI / 180
const UK_CENTRE = ll(54.25, -2.6)

export const CAMERA_KEYS: Key[] = [
  { p: 0.0, target: [-0.15, DOCK_H + 1.0, -9.5], az: 20 * deg, el: 32 * deg, dist: 3.9 },
  { p: 0.12, target: [-0.1, DOCK_H + 1.0, -9.5], az: 6 * deg, el: 38 * deg, dist: 3.0 },
  { p: 0.2, target: [0, DOCK_H + 1.05, -9.5], az: -14 * deg, el: 40 * deg, dist: 2.7 },
  { p: 0.3, target: [0.3, DOCK_H + 1.1, -9.4], az: 10 * deg, el: 26 * deg, dist: 3.4 },
  { p: 0.37, target: [1.2, DOCK_H + 0.9, -8.6], az: 32 * deg, el: 26 * deg, dist: 6.4 },
  { p: 0.43, target: [0.3, DOCK_H + 1.0, -3.2], az: 140 * deg, el: 30 * deg, dist: 8 },
  { p: 0.48, target: [-0.6, DOCK_H + 1.1, 2.6], az: 172 * deg, el: 17 * deg, dist: 7.2 },
  { p: 0.505, target: [-0.6, DOCK_H + 1.1, 2.8], az: 176 * deg, el: 16 * deg, dist: 7.4 },
  { p: 0.535, target: [-0.2, DOCK_H + 1.0, 3.6], az: 74 * deg, el: 28 * deg, dist: 15 },
  { p: 0.58, target: [0, 1.6, 5], az: 52 * deg, el: 28 * deg, dist: 30 },
  { p: 0.63, target: [0, 1, 6], az: 34 * deg, el: 38 * deg, dist: 78 },
  { p: 0.7, target: [0, 0, 30], az: 18 * deg, el: 50 * deg, dist: 260 },
  { p: 0.8, target: [UK_CENTRE.x * 0.04, 0, UK_CENTRE.z * 0.04], az: 8 * deg, el: 66 * deg, dist: 42000 },
  { p: 0.92, target: [UK_CENTRE.x, 0, UK_CENTRE.z], az: 0, el: 84 * deg, dist: 1.55e6 },
  { p: 1.0, target: [UK_CENTRE.x, 0, UK_CENTRE.z], az: 0, el: 86 * deg, dist: 1.6e6 },
]

const tmpA = new THREE.Vector3()
const tmpB = new THREE.Vector3()
/** Camera rig state at progress p: target + spherical offset with log-interpolated distance. */
export function cameraAt(p: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  let i = 0
  while (i < CAMERA_KEYS.length - 2 && p > CAMERA_KEYS[i + 1].p) i++
  const k0 = CAMERA_KEYS[i]
  const k1 = CAMERA_KEYS[i + 1]
  const raw = clamp01((p - k0.p) / (k1.p - k0.p))
  const t = raw * raw * (3 - 2 * raw)
  tmpA.set(...k0.target)
  tmpB.set(...k1.target)
  const dist = Math.exp(lerp(Math.log(k0.dist), Math.log(k1.dist), t))
  // on big zooms the target moves in step with the view size, so what's in frame stays in frame
  const big = k1.dist / k0.dist > 20
  const tt = big ? (dist - k0.dist) / (k1.dist - k0.dist) : t
  outTarget.copy(tmpA).lerp(tmpB, tt)
  const az = lerp(k0.az, k1.az, t)
  const el = lerp(k0.el, k1.el, t)
  outPos.set(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist).add(outTarget)
  return dist
}
