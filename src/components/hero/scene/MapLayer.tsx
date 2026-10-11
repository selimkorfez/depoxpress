'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { UK, IRELAND } from '../ukGeo'
import { BRAND, CITIES, MOTORWAYS, ll, ramp, type Route } from './world'

type Progress = { current: number }

/** Land polygons (km → m) as flat meshes in the x/z plane. */
function useLand(polys: [number, number][][]) {
  return useMemo(() => {
    const shapes = polys.map((ring) => new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x * 1000, -z * 1000))))
    const g = new THREE.ShapeGeometry(shapes, 1)
    g.rotateX(-Math.PI / 2)
    const outline = polys.map((ring) => {
      const pts = ring.map(([x, z]) => new THREE.Vector3(x * 1000, 0, z * 1000))
      return new THREE.BufferGeometry().setFromPoints(pts)
    })
    return { g, outline }
  }, [polys])
}

/** Fields and hedgerows around the site so the mid-zoom isn't a flat colour. */
function Fields() {
  const mesh = useMemo(() => {
    const count = 420
    const geo = new THREE.PlaneGeometry(1, 1)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshStandardMaterial({ roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
    const inst = new THREE.InstancedMesh(geo, mat, count)
    const o = new THREE.Object3D()
    const palette = ['#b9c8a5', '#c7d1ad', '#d6d3a6', '#aebf98', '#c2cca0', '#d9dcc0'].map((c) => new THREE.Color(c))
    let s = 11
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    for (let i = 0; i < count; i++) {
      const ring = 260 + Math.pow(r(), 1.6) * 6000
      const a = r() * Math.PI * 2
      const x = Math.cos(a) * ring
      const z = Math.sin(a) * ring
      const size = 120 + r() * 380
      o.position.set(x, -0.02, z)
      o.rotation.set(0, r() * Math.PI, 0)
      o.scale.set(size, 1, size * (0.5 + r()))
      o.updateMatrix()
      inst.setMatrixAt(i, o.matrix)
      inst.setColorAt(i, palette[i % palette.length])
    }
    return inst
  }, [])
  return <primitive object={mesh} />
}

export type LabelRefs = { current: (HTMLDivElement | null)[] }

/** A flat ribbon along a polyline; width and reveal are driven by uniforms. */
function ribbonGeometry(pts: THREE.Vector3[], cum: number[]) {
  const pos: number[] = []
  const side: number[] = []
  const perp: number[] = []
  const dist: number[] = []
  const index: number[] = []
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const len = Math.hypot(dx, dz) || 1
    for (const sd of [-1, 1]) {
      pos.push(p.x, 0, p.z)
      side.push(sd)
      perp.push(-dz / len, dx / len)
      dist.push(cum[i])
    }
    if (i > 0) {
      const k = i * 2
      index.push(k - 2, k - 1, k, k - 1, k + 1, k)
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('side', new THREE.Float32BufferAttribute(side, 1))
  g.setAttribute('perp', new THREE.Float32BufferAttribute(perp, 2))
  g.setAttribute('dist', new THREE.Float32BufferAttribute(dist, 1))
  g.setIndex(index)
  g.computeBoundingSphere()
  if (g.boundingSphere) g.boundingSphere.radius += 5000
  return g
}

function ribbonMaterial(color: string) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uWidth: { value: 1 }, uReveal: { value: 0 }, uOpacity: { value: 0 } },
    vertexShader: `
      attribute float side; attribute vec2 perp; attribute float dist;
      uniform float uWidth; varying float vDist;
      void main() {
        vDist = dist;
        vec3 p = position + vec3(perp.x, 0.0, perp.y) * side * uWidth * 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uReveal; uniform float uOpacity; varying float vDist;
      void main() {
        if (vDist > uReveal) discard;
        gl_FragColor = vec4(uColor, uOpacity);
      }`,
  })
}

const pv = new THREE.Vector3()

/**
 * The UK underneath everything: land, sea, the routes each lorry draws as it
 * travels, destination markers, and the DOM labels (projected here each frame,
 * after the camera has moved).
 */
export function MapLayer({ progress, routes, departures, labels }: { progress: Progress; routes: Route[]; departures: number[]; labels: LabelRefs }) {
  const uk = useLand(UK)
  const ie = useLand(IRELAND)
  const { size } = useThree()
  const landMat = useMemo(() => new THREE.MeshStandardMaterial({ color: BRAND.land, roughness: 1 }), [])
  const irelandMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c3cbbb', roughness: 1 }), [])
  const coastMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }), [])
  const markers = useRef<(THREE.Group | null)[]>([])
  const lift = useRef<THREE.Group>(null)
  const roads = useMemo(() => {
    const mat = ribbonMaterial('#f6f4ec')
    const geos = MOTORWAYS.map((way) => {
      const pts = new THREE.CatmullRomCurve3(way.map(([la, lo]) => ll(la, lo))).getPoints(way.length * 8)
      const cum = [0]
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + pts[k].distanceTo(pts[k - 1]))
      return ribbonGeometry(pts, cum)
    })
    mat.uniforms.uReveal.value = 1e9
    return { mat, geos }
  }, [])
  const pin = useRef<THREE.Group>(null)

  // Route polylines: dense where it matters (the yard), sparse on the motorway
  const routePoints = useMemo(
    () =>
      routes.map((r) => {
        const pts: THREE.Vector3[] = []
        r.curve.curves.forEach((c, i) => {
          const n = i === 0 ? 2 : i === 1 ? 24 : 140
          const sample = c.getSpacedPoints(n)
          ;(i === 0 ? sample : sample.slice(1)).forEach((pt) => pts.push(pt.clone().setY(0)))
        })
        const cum = [0]
        for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + pts[k].distanceTo(pts[k - 1]))
        return { geo: ribbonGeometry(pts, cum), mat: ribbonMaterial(r.city === 'london' ? BRAND.signal : '#3b6cf0'), total: cum[cum.length - 1] }
      }),
    [routes],
  )

  useFrame(({ camera }) => {
    const p = progress.current
    const camDist = Math.max(1, camera.position.y)
    const show = ramp(p, 0.72, 0.84)
    coastMat.opacity = ramp(p, 0.8, 0.9) * 0.7
    // keep lines/markers just above the ground at every zoom level (depth precision)
    if (lift.current) lift.current.position.y = 0.3 + camDist * 0.004
    roads.mat.uniforms.uWidth.value = camDist * 0.0026
    roads.mat.uniforms.uOpacity.value = ramp(p, 0.72, 0.8) * 0.85

    routes.forEach((r, i) => {
      const u = (p - departures[i]) / (0.955 - departures[i])
      const rib = routePoints[i]
      const a = Math.log(r.length / 4)
      const d = u <= 0 ? 0 : u >= 1 ? r.length : (r.length * (Math.exp(a * u) - 1)) / (Math.exp(a) - 1)
      // the route is drawn up to the lorry (polyline is a touch shorter than the curve)
      rib.mat.uniforms.uReveal.value = d * (rib.total / r.length)
      rib.mat.uniforms.uWidth.value = Math.max(1.2, camDist * (r.city === 'london' ? 0.0042 : 0.0032))
      rib.mat.uniforms.uOpacity.value = ramp(p, 0.66, 0.72) * 0.95
      const arrived = u >= 0.985
      const mk = markers.current[i]
      if (mk) {
        mk.scale.setScalar(Math.max(1, camDist * 0.0038 * (arrived ? 1.3 : 0.9)))
        mk.visible = show > 0.01
      }
      const el = labels.current[i + 1]
      if (el) {
        el.dataset.arrived = arrived ? 'true' : 'false'
        place(el, CITIES[r.city], show)
      }
    })
    if (pin.current) {
      pin.current.scale.setScalar(Math.max(1, camDist * 0.0045))
      pin.current.visible = p > 0.66
    }
    const home = labels.current[0]
    if (home) place(home, CITIES.hinckley, ramp(p, 0.68, 0.76))

    function place(el: HTMLDivElement, at: THREE.Vector3, opacity: number) {
      pv.copy(at).project(camera)
      const onScreen = pv.z < 1 && Math.abs(pv.x) < 1.2 && Math.abs(pv.y) < 1.2
      el.style.opacity = onScreen ? String(opacity) : '0'
      if (!onScreen || opacity <= 0) return
      el.style.transform = `translate3d(${((pv.x + 1) / 2) * size.width}px, ${((1 - pv.y) / 2) * size.height}px, 0)`
    }
  })

  return (
    <group>
      {/* sea */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-100000, -40, -250000]}>
        <planeGeometry args={[9e6, 9e6]} />
        <meshStandardMaterial color={BRAND.sea} roughness={0.9} />
      </mesh>
      {/* land */}
      <mesh geometry={ie.g} material={irelandMat} position={[0, -0.06, 0]} />
      <mesh geometry={uk.g} material={landMat} position={[0, -0.05, 0]} />
      {uk.outline.map((g, i) => (
        <lineLoop key={i} geometry={g} material={coastMat} position={[0, 2, 0]} />
      ))}
      <Fields />

      <group ref={lift}>
        {/* routes */}
        {roads.geos.map((g, i) => (
          <mesh key={`m${i}`} geometry={g} material={roads.mat} renderOrder={1} position={[0, -0.5, 0]} />
        ))}
        {routePoints.map(({ geo, mat }, i) => (
          <mesh key={i} geometry={geo} material={mat} renderOrder={2} />
        ))}

        {/* destinations */}
        {routes.map((r, i) => {
          const pos = CITIES[r.city]
          return (
            <group
              key={r.city}
              position={[pos.x, 0, pos.z]}
              ref={(el) => {
                markers.current[i] = el
              }}
              visible={false}
            >
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.2, 24]} />
                <meshBasicMaterial color={BRAND.amber} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <ringGeometry args={[2.8, 3.6, 32]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          )
        })}

        {/* Hinckley pin */}
        <group ref={pin} visible={false}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.6, 28]} />
            <meshBasicMaterial color={BRAND.signal} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <ringGeometry args={[3.4, 4.4, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>
    </group>
  )
}
