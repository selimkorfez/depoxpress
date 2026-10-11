'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import {
  BAY_CITY,
  BAY_X,
  BOX,
  DOCK_H,
  HERO_BAY,
  HERO_SLOT,
  PULL,
  SLOTS,
  T,
  TABLE,
  TABLE_TOP,
  TRAILER_REAR_Z,
  buildRoute,
  cameraAt,
  clamp01,
  departStart,
  easeOutBack,
  lerp,
  lin,
  ramp,
  slotLocal,
  travelled,
  type CityKey,
} from './world'
import {
  FORK_PALLET_Z,
  Forklift,
  HERO_STACK_H,
  ITEM_END,
  ITEM_START,
  Lorry,
  PALLET_H,
  PackingTable,
  PalletLoad,
  Parcel,
  Warehouse,
  Yard,
  useCargoGeometries,
  useMaterials,
  type ForkliftRefs,
  type LorryRefs,
  type ParcelRefs,
} from './models'
import { MapLayer, type LabelRefs } from './MapLayer'

type Progress = { current: number }

export type SceneLabels = { cities: Record<CityKey, string>; hinckley: string }

const FOG = '#eceee9'
const STILL_P = 0.585

/* Forklift drive path (dock floor, world x/z) */
const FORK_START = new THREE.Vector3(1.6, DOCK_H, -10.95)
const FORK_PATH = new THREE.CatmullRomCurve3(
  [
    FORK_START.clone(),
    new THREE.Vector3(1.75, DOCK_H, -7.4),
    new THREE.Vector3(0.6, DOCK_H, -4.2),
    new THREE.Vector3(-0.62, DOCK_H, -1.6),
    new THREE.Vector3(-0.62, DOCK_H, 0.3),
    new THREE.Vector3(-0.62, DOCK_H, TRAILER_REAR_Z + slotLocal(HERO_SLOT).z - FORK_PALLET_Z),
  ],
  false,
  'centripetal',
)
const FORK_BACK = new THREE.Vector3(-0.62, DOCK_H, -3.4)

/** Initial and final fill for every lorry (fraction of the 20 pallet slots). */
const FILL_FROM = [0.3, 0.55, 0.2, 0.8, 0.45, 0.25, 0.6]
const FILL_WINDOW: [number, number][] = [
  [0.36, 0.56],
  [0.38, 0.55],
  [0.37, 0.6],
  [0.5, 0.56],
  [0.4, 0.58],
  [0.36, 0.59],
  [0.42, 0.57],
]

function makeParcelRefs(): ParcelRefs {
  return {
    root: { current: null },
    front: { current: null },
    back: { current: null },
    left: { current: null },
    right: { current: null },
    tape: { current: null },
    tapeEndA: { current: null },
    tapeEndB: { current: null },
    gun: { current: null },
    label: { current: null },
    items: { current: [] },
  }
}
const makeLorryRefs = (): LorryRefs => ({
  root: { current: null },
  body: { current: null },
  doorL: { current: null },
  doorR: { current: null },
  curtainL: { current: null },
  curtainR: { current: null },
  token: { current: null },
})

/* scratch objects (no allocations per frame) */
const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const q1 = new THREE.Quaternion()
const m1 = new THREE.Matrix4()
const m2 = new THREE.Matrix4()
const m3 = new THREE.Matrix4()
const up = new THREE.Vector3(0, 1, 0)
const one = new THREE.Vector3(1, 1, 1)
const camPos = new THREE.Vector3()
const camTarget = new THREE.Vector3()

/** Runs before everything else each frame: smooths progress and places the camera. */
function CameraRig({ progress, smooth, still, stillAt, m, state }: { progress: Progress; smooth: Progress; still: boolean; stillAt: number; m: ReturnType<typeof useMaterials>; state: { dist: number } }) {
  const { camera, scene } = useThree()
  useFrame(({ pointer }, dt) => {
    const target = still ? stillAt : progress.current
    smooth.current += (target - smooth.current) * Math.min(1, dt * 4.5)
    const p = smooth.current
    const cam = camera as THREE.PerspectiveCamera
    const dist = cameraAt(p, camPos, camTarget)
    state.dist = dist
    if (!still && p < 0.62) {
      // a touch of parallax while we're close in
      const k = dist * 0.035 * (1 - ramp(p, 0.5, 0.62))
      v1.subVectors(camTarget, camPos).normalize()
      v2.crossVectors(v1, up).normalize()
      camPos.addScaledVector(v2, pointer.x * k).addScaledVector(up, pointer.y * k * 0.6)
    }
    cam.position.copy(camPos)
    cam.up.copy(up)
    cam.lookAt(camTarget)
    const near = Math.max(0.03, dist * 0.012)
    const far = Math.min(6e7, dist * 80 + 400)
    if (Math.abs(cam.near - near) / near > 0.02 || Math.abs(cam.far - far) / far > 0.02) {
      cam.near = near
      cam.far = far
      cam.updateProjectionMatrix()
    }
    cam.updateMatrixWorld()
    // fade the dock wall while the camera is passing through it
    const wallFade = clamp01((Math.abs(camPos.z - 0.1) - 0.6) / 2.2)
    for (const mat of [m.dockWall, m.dockBand, m.sign]) {
      mat.opacity = wallFade
      mat.depthWrite = wallFade > 0.98
      mat.visible = wallFade > 0.02
    }
    const fog = scene.fog as THREE.Fog | null
    if (fog) {
      fog.near = dist * 4.5
      fog.far = dist * (p > 0.75 ? 60 : 20)
    }
  })
  return null
}

function Rig({ progress, still, stillAt = STILL_P, labelRefs }: { progress: Progress; still: boolean; stillAt?: number; labelRefs: LabelRefs }) {
  const m = useMaterials()
  const cargoGeo = useCargoGeometries()
  const parcel = useMemo(makeParcelRefs, [])
  const fork = useMemo<ForkliftRefs>(() => ({ root: { current: null }, carriage: { current: null }, beacon: { current: null }, load: { current: null } }), [])
  const lorries = useMemo(() => BAY_X.map(makeLorryRefs), [])
  const heroPallet = useRef<THREE.Group>(null)
  const routes = useMemo(() => BAY_X.map((_, i) => buildRoute(i)), [])
  const departures = useMemo(() => BAY_X.map((_, i) => departStart(i)), [])
  const smooth = useRef(still ? stillAt : 0)
  const camState = useMemo(() => ({ dist: 1 }), [])
  const { camera, size, scene, gl } = useThree()

  // expose the scene for QA when a frozen frame is requested (?scene=…)
  useEffect(() => {
    if (still && typeof window !== 'undefined' && window.location.search.includes('scene=')) (window as unknown as { __dx: unknown }).__dx = { scene, camera, gl }
  }, [still, scene, camera, gl])

  const cargo = useMemo(() => {
    const count = BAY_X.length * SLOTS
    const stack = new THREE.InstancedMesh(cargoGeo.stack, m.stack, count)
    const base = new THREE.InstancedMesh(cargoGeo.base, m.wood, count)
    stack.frustumCulled = false
    base.frustumCulled = false
    return { stack, base }
  }, [cargoGeo, m])

  // fog that follows the zoom, and view offset so the scene sits beside the copy
  useEffect(() => {
    scene.fog = new THREE.Fog(FOG, 20, 80)
    return () => {
      scene.fog = null
    }
  }, [scene])

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    if (aspect > 1.15) {
      cam.setViewOffset(size.width, size.height, -size.width * Math.min(0.2, 0.1 + (aspect - 1.15) * 0.15), 0, size.width, size.height)
    } else if (aspect < 0.9) {
      cam.setViewOffset(size.width, size.height, 0, size.height * 0.17, size.width, size.height)
    } else {
      cam.clearViewOffset()
    }
    cam.fov = aspect < 0.75 ? 52 : aspect < 1.15 ? 44 : 36
    cam.updateProjectionMatrix()
  }, [camera, size])

  useFrame(({ clock }) => {
    const p = smooth.current
    const t = still ? 0 : clock.elapsedTime
    const dist = camState.dist

    /* ---------------- parcel: pick, close, tape, label ---------------- */
    const items = parcel.items.current
    const drop = T.itemsDrop
    const slice = (drop[1] - drop[0]) / items.length
    items.forEach((it, i) => {
      if (!it) return
      const a = drop[0] + i * slice * 0.92
      const k = ramp(p, a, a + slice * 1.25)
      const s = ITEM_START[i]
      const e = ITEM_END[i]
      if (i === 3) {
        // tissue sheet laid over the top of the products
        it.position.set(lerp(s[0], e[0], k), lerp(s[1], e[1], k) + Math.sin(k * Math.PI) * 0.25, lerp(s[2], e[2], k))
        it.rotation.set(0, lerp(0.4, 0, k), Math.sin(k * Math.PI) * 0.4)
        it.scale.set(lerp(1, 2.1, k), 1, lerp(1, 2.2, k))
        it.visible = p < T.flapsLong[1]
      } else {
        it.position.set(lerp(s[0], e[0], k), lerp(s[1], e[1], k) + Math.sin(k * Math.PI) * 0.32, lerp(s[2], e[2], k))
        it.rotation.set(0, Math.sin(k * Math.PI) * 0.8, Math.sin(k * Math.PI) * 0.6)
        it.visible = p < T.flapsLong[1] + 0.01
      }
    })
    const shortK = ramp(p, ...T.flapsShort)
    const longK = ramp(p, ...T.flapsLong)
    const wobble = still ? 0 : Math.sin(t * 2.2) * 0.05 * (1 - shortK)
    if (parcel.left.current) parcel.left.current.rotation.z = lerp(2.05 + wobble, -Math.PI / 2, shortK)
    if (parcel.right.current) parcel.right.current.rotation.z = lerp(-2.05 - wobble, Math.PI / 2, shortK)
    if (parcel.front.current) parcel.front.current.rotation.x = lerp(1.95 + wobble, -Math.PI / 2, longK)
    if (parcel.back.current) parcel.back.current.rotation.x = lerp(-1.95 - wobble, Math.PI / 2, longK)

    const tapeK = lin(p, ...T.tape)
    const tapeLen = BOX.w + 0.008
    if (parcel.tape.current) {
      parcel.tape.current.scale.x = Math.max(0.0001, tapeLen * ramp(tapeK, 0.08, 0.92))
      parcel.tape.current.visible = tapeK > 0.08
    }
    if (parcel.tapeEndA.current) parcel.tapeEndA.current.visible = tapeK > 0.06
    if (parcel.tapeEndB.current) parcel.tapeEndB.current.visible = tapeK > 0.94
    if (parcel.gun.current) {
      const g = parcel.gun.current
      g.visible = tapeK > 0 && tapeK < 1
      const tip = -BOX.w / 2 + tapeLen * ramp(tapeK, 0.08, 0.92)
      const lift = (1 - ramp(tapeK, 0, 0.1)) * 0.25 + ramp(tapeK, 0.92, 1) * 0.25
      g.position.set(tip, BOX.h + 0.012 + lift, 0)
      g.rotation.set(0, 0, -0.15 + ramp(tapeK, 0.9, 1) * 0.5)
    }
    const labelK = lin(p, ...T.label)
    if (parcel.label.current) {
      const l = parcel.label.current
      const s = labelK <= 0 ? 0.0001 : easeOutBack(labelK)
      l.scale.setScalar(Math.max(0.0001, s))
      l.position.z = BOX.d / 2 + 0.002 + (1 - ramp(labelK, 0, 0.7)) * 0.12
      l.rotation.z = (1 - ramp(labelK, 0, 1)) * -0.3
      l.visible = labelK > 0
    }

    /* ---------------- forklift ---------------- */
    const fk = fork.root.current
    const driveK = ramp(p, ...T.drive)
    const placeK = ramp(p, ...T.place)
    const backK = ramp(p, ...T.reverse)
    if (fk) {
      if (backK > 0) {
        const end = FORK_PATH.getPointAt(1)
        fk.position.lerpVectors(end, FORK_BACK, backK)
        fk.rotation.set(0, Math.sin(backK * Math.PI) * -0.12, 0)
      } else {
        FORK_PATH.getPointAt(driveK, fk.position)
        FORK_PATH.getTangentAt(Math.min(0.999, Math.max(0.001, driveK)), v1)
        fk.rotation.set(0, Math.atan2(v1.x, v1.z), 0)
      }
    }
    if (fork.carriage.current) {
      // raised to bench height while loading, low for travel, dropped into the trailer
      const raise = lerp(0.62, 0.2, ramp(p, T.drive[0], T.drive[0] + 0.02))
      fork.carriage.current.position.y = backK > 0 ? lerp(-0.07, 0.15, backK) : lerp(raise, -0.07, placeK)
    }
    if (fork.beacon.current) (fork.beacon.current.material as THREE.MeshStandardMaterial).emissiveIntensity = still ? 2 : 1 + Math.max(0, Math.sin(t * 9)) * 3

    /* ---------------- lorries ---------------- */
    const lorryMatrices: THREE.Matrix4[] = []
    BAY_X.forEach((x, i) => {
      const L = lorries[i]
      const root = L.root.current
      if (!root) return
      const pull = ramp(p, 0.555, 0.585)
      const start = departures[i]
      const r = routes[i]
      const u = clamp01((p - start) / (T.arrive - start))
      let scale = 1
      if (u > 0) {
        const d = travelled(u, r.length)
        const k = Math.max(0.00001, Math.min(0.99999, d / r.length))
        r.curve.getPointAt(k, root.position)
        r.curve.getTangentAt(k, v1)
        root.rotation.set(0, Math.atan2(v1.x, v1.z), 0)
        scale = 1 + Math.max(0, dist / 520 - 1) * ramp(d, 40, 600)
      } else {
        root.position.set(x, 0, TRAILER_REAR_Z + PULL * pull)
        root.rotation.set(0, 0, 0)
      }
      root.scale.setScalar(scale)
      if (L.token.current) L.token.current.visible = scale > 25
      const doors = ramp(p, ...T.doors)
      const openA = Math.PI * 1.46
      if (L.doorL.current) L.doorL.current.rotation.y = lerp(openA, 0, doors)
      if (L.doorR.current) L.doorR.current.rotation.y = lerp(-openA, 0, doors)
      const cur = ramp(p, T.curtains[0] + i * 0.002, T.curtains[1])
      if (L.curtainL.current) L.curtainL.current.scale.x = lerp(0.07, 1, cur)
      if (L.curtainR.current) L.curtainR.current.scale.x = lerp(0.07, 1, cur)
      root.updateMatrix()
      lorryMatrices[i] = root.matrix
    })

    /* ---------------- cargo inside the trailers ---------------- */
    let n = 0
    BAY_X.forEach((_, i) => {
      const lm = lorryMatrices[i]
      if (!lm) return
      const hidden = ramp(p, T.curtains[1], T.curtains[1] + 0.01) * ramp(p, T.doors[1], T.doors[1] + 0.01)
      for (let s = 0; s < SLOTS; s++) {
        let vis: number
        if (i === HERO_BAY) {
          if (s === HERO_SLOT) vis = 0
          else if (s < 16 || s === 17) vis = 1
          else vis = ramp(p, 0.505 + (s - 18) * 0.02, 0.525 + (s - 18) * 0.02)
        } else {
          const from = FILL_FROM[i] * SLOTS
          const [a, b] = FILL_WINDOW[i]
          const filled = lerp(from, SLOTS, ramp(p, a, b))
          vis = clamp01(filled - s)
        }
        const sc = vis <= 0 || hidden >= 1 ? 0 : vis >= 1 ? 1 : easeOutBack(vis)
        v3.copy(slotLocal(s))
        m2.compose(v3, q1.identity(), one)
        m3.makeScale(sc || 0.00001, sc || 0.00001, sc || 0.00001)
        m1.multiplyMatrices(lm, m2).multiply(m3)
        cargo.stack.setMatrixAt(n, m1)
        cargo.base.setMatrixAt(n, m1)
        n++
      }
    })
    cargo.stack.count = n
    cargo.base.count = n
    cargo.stack.instanceMatrix.needsUpdate = true
    cargo.base.instanceMatrix.needsUpdate = true

    /* ---------------- hero pallet: on the forks, then in the trailer ---------------- */
    const hp = heroPallet.current
    if (hp && fork.load.current && fk) {
      if (placeK < 1 || backK <= 0) {
        fk.updateMatrixWorld(true)
        fork.load.current.matrixWorld.decompose(hp.position, hp.quaternion, hp.scale)
      }
      if (backK > 0) {
        const lm = lorryMatrices[HERO_BAY]
        if (lm) {
          m2.compose(slotLocal(HERO_SLOT), q1.identity(), one)
          m1.multiplyMatrices(lm, m2)
          m1.decompose(hp.position, hp.quaternion, hp.scale)
        }
      }
      hp.updateMatrix()
      hp.visible = ramp(p, T.curtains[1], T.curtains[1] + 0.01) < 1 || ramp(p, T.doors[1], T.doors[1] + 0.01) < 1
    }

    /* ---------------- parcel world transform ---------------- */
    const box = parcel.root.current
    if (box && hp) {
      const tableX = TABLE.x
      const tableY = TABLE.y + TABLE_TOP
      const tableZ = TABLE.z
      // seat on top of the hero pallet's stack (pallet-local)
      m2.compose(v3.set(0.2, PALLET_H + HERO_STACK_H, 0.25), q1.identity(), one)
      m1.multiplyMatrices(hp.matrix, m2)
      m1.decompose(v2, q1, v1)
      const k = ramp(p, ...T.boxToPallet)
      if (k <= 0) {
        box.position.set(tableX, tableY, tableZ)
        box.quaternion.identity()
        box.scale.setScalar(1)
      } else if (k < 1) {
        box.position.set(lerp(tableX, v2.x, k), lerp(tableY, v2.y, k) + Math.sin(k * Math.PI) * 0.55, lerp(tableZ, v2.z, k))
        box.quaternion.identity().slerp(q1, k)
        box.scale.setScalar(1)
      } else {
        box.position.copy(v2)
        box.quaternion.copy(q1)
        box.scale.copy(v1)
      }
      box.visible = hp.visible || k < 1
    }
  })

  return (
    <group>
      <CameraRig progress={progress} smooth={smooth} still={still} stillAt={stillAt} m={m} state={camState} />
      <Warehouse m={m} />
      <Yard m={m} />
      <PackingTable m={m} />
      <Parcel refs={parcel} m={m} />
      <Forklift refs={fork} m={m} />
      <group ref={heroPallet} matrixAutoUpdate={false}>
        <PalletLoad m={m} stackH={HERO_STACK_H} />
      </group>
      {lorries.map((refs, i) => (
        <Lorry key={i} refs={refs} m={m} />
      ))}
      <primitive object={cargo.stack} />
      <primitive object={cargo.base} />
      <MapLayer progress={smooth} routes={routes} departures={departures} labels={labelRefs} />
    </group>
  )
}

export default function DispatchScene({ progress, still = false, stillAt, labels }: { progress: Progress; still?: boolean; stillAt?: number; labels: SceneLabels }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [small, setSmall] = useState(false)
  const [dpr, setDpr] = useState(1.5)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])

  // Only render frames while the hero is on screen
  useEffect(() => {
    setSmall(window.matchMedia('(max-width: 760px)').matches)
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={still ? 'demand' : visible ? 'always' : 'never'}
        dpr={small ? Math.min(dpr, 1.5) : dpr}
        camera={{ fov: 36, position: [2, 3, -6], near: 0.03, far: 500 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
      >
        <PerformanceMonitor onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))} onDecline={() => setDpr(1)} />
        <hemisphereLight args={['#ffffff', '#b9c3ad', 1.1]} />
        <directionalLight position={[30, 60, 25]} intensity={2.1} color="#fff6ea" />
        <directionalLight position={[-40, 25, -30]} intensity={0.6} color="#dfe8ff" />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2} position={[0, 5, 6]} scale={[10, 3, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.2} position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} color="#e3ecff" />
          <Lightformer form="ring" intensity={1.4} position={[5, 4, 2]} scale={2} color="#fff3dc" />
        </Environment>
        <Rig progress={progress} still={still} stillAt={stillAt} labelRefs={labelRefs} />
      </Canvas>
      <div className="map-labels" aria-hidden="true">
        {[labels.hinckley, ...BAY_X.map((_, i) => labels.cities[BAY_CITY[i]])].map((text, i) => (
          <div
            key={i}
            className={`map-label${i === 0 ? ' map-label-home' : ''}`}
            data-align={i === 0 ? undefined : ({ cardiff: 'left', manchester: 'left', bristol: 'right', leeds: 'right' } as Record<string, string>)[BAY_CITY[i - 1]]}
            ref={(el) => {
              labelRefs.current[i] = el
            }}
            style={{ opacity: 0 }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
