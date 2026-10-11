'use client'

import { useMemo, type RefObject } from 'react'
import * as THREE from 'three'
import { BAY_X, BOX, BRAND, DOCK_H, TABLE, TABLE_TOP } from './world'
import { asphaltTexture, blobTexture, cartonStackTexture, curtainTexture, floorTexture, kraftTexture, labelTexture, canvasTexture } from './textures'

type G = RefObject<THREE.Group | null>
type M = RefObject<THREE.Mesh | null>

/* ------------------------------------------------------------------ */
/* Shared materials                                                    */
/* ------------------------------------------------------------------ */
export function useMaterials() {
  return useMemo(() => {
    const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p)
    return {
      kraft: std({ map: kraftTexture(), roughness: 0.92, side: THREE.DoubleSide }),
      kraftInner: std({ color: '#9a6a3a', roughness: 1, side: THREE.DoubleSide }),
      tape: std({ color: BRAND.tape, roughness: 0.3, metalness: 0.05 }),
      label: std({ map: labelTexture(), roughness: 0.6, transparent: true }),
      stack: std({ map: cartonStackTexture(), roughness: 0.85 }),
      wood: std({ color: '#b98a55', roughness: 0.95 }),
      steel: std({ color: '#9aa3ad', roughness: 0.35, metalness: 0.75 }),
      darkSteel: std({ color: '#3b424c', roughness: 0.5, metalness: 0.6 }),
      black: std({ color: '#16181c', roughness: 0.8 }),
      rubber: std({ color: '#1b1d21', roughness: 0.95 }),
      amber: std({ color: BRAND.amber, roughness: 0.45, metalness: 0.1 }),
      navy: std({ color: BRAND.navy, roughness: 0.5, metalness: 0.15 }),
      signal: std({ color: BRAND.signal, roughness: 0.45 }),
      white: std({ color: '#f5f6f8', roughness: 0.4, metalness: 0.1 }),
      glass: std({ color: '#1d2a3b', roughness: 0.08, metalness: 0.6 }),
      beacon: std({ color: '#ffb020', emissive: '#ff9500', emissiveIntensity: 2, roughness: 0.3 }),
      curtain: std({ map: curtainTexture(), roughness: 0.75, side: THREE.DoubleSide }),
      tabletop: std({ color: '#d8c3a0', roughness: 0.7 }),
      floor: std({ map: floorTexture(), roughness: 0.55, metalness: 0.05 }),
      // ground layers are painted in a fixed order (see GROUND) instead of depth-tested
      asphalt: std({ map: asphaltTexture(), roughness: 0.95, depthTest: false, depthWrite: false }),
      paint: std({ color: '#f1f1ec', roughness: 0.8, depthTest: false, depthWrite: false }),
      groundBlob: new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }),
      walkway: std({ color: '#f2c230', roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 }),
      leveller: std({ color: '#3b424c', roughness: 0.5, metalness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 }),
      cladding: std({ color: '#dfe3e8', roughness: 0.6, metalness: 0.2 }),
      // dock-face pieces fade out while the camera passes through the wall
      dockWall: std({ color: '#dfe3e8', roughness: 0.6, metalness: 0.2, transparent: true }),
      dockBand: std({ color: '#2a3e5f', roughness: 0.55, metalness: 0.25, transparent: true }),
      sign: new THREE.MeshBasicMaterial({ map: signTexture(), transparent: true }),
      claddingDark: std({ color: '#2a3e5f', roughness: 0.55, metalness: 0.25 }),
      roof: std({ color: '#b9c1cb', roughness: 0.55, metalness: 0.35 }),
      concrete: std({ color: '#bdb8ae', roughness: 0.9 }),
      rack: std({ color: '#2457e6', roughness: 0.5, metalness: 0.3 }),
      beam: std({ color: '#f07c1b', roughness: 0.5, metalness: 0.3 }),
      tree: std({ color: '#6f8d5e', roughness: 1 }),
      trunk: std({ color: '#6b513a', roughness: 1 }),
      blob: new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -12 }),
    }
  }, [])
}
export type Mats = ReturnType<typeof useMaterials>

/** Draw order for flat ground layers (sea → land → fields → tarmac → markings → shadows). */
export const GROUND = { sea: -10, land: -9, fields: -8, asphalt: -7, paint: -6, shadow: -5 }

/* ------------------------------------------------------------------ */
/* The parcel: walls, four hinged flaps, tape, label and the products  */
/* ------------------------------------------------------------------ */
export type ParcelRefs = {
  root: G
  front: G
  back: G
  left: G
  right: G
  tape: M
  tapeEndA: M
  tapeEndB: M
  gun: G
  label: M
  items: RefObject<(THREE.Mesh | null)[]>
}

const T_WALL = 0.008
const FLAP = BOX.d / 2

export function Parcel({ refs, m }: { refs: ParcelRefs; m: Mats }) {
  const { w, d, h } = BOX
  const productMats = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: BRAND.navy, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: '#e8eef9', roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: BRAND.signal, roughness: 0.35 }),
      new THREE.MeshStandardMaterial({ color: '#f7e7c8', roughness: 0.8 }),
    ],
    [],
  )
  const tapeGeo = useMemo(() => new THREE.BoxGeometry(1, 0.0025, 0.05).translate(0.5, 0, 0), [])
  return (
    <group ref={refs.root}>
      {/* walls */}
      <mesh material={m.kraft} position={[0, T_WALL / 2, 0]}>
        <boxGeometry args={[w, T_WALL, d]} />
      </mesh>
      <mesh material={m.kraft} position={[0, h / 2, d / 2 - T_WALL / 2]}>
        <boxGeometry args={[w, h, T_WALL]} />
      </mesh>
      <mesh material={m.kraft} position={[0, h / 2, -d / 2 + T_WALL / 2]}>
        <boxGeometry args={[w, h, T_WALL]} />
      </mesh>
      <mesh material={m.kraft} position={[w / 2 - T_WALL / 2, h / 2, 0]}>
        <boxGeometry args={[T_WALL, h, d]} />
      </mesh>
      <mesh material={m.kraft} position={[-w / 2 + T_WALL / 2, h / 2, 0]}>
        <boxGeometry args={[T_WALL, h, d]} />
      </mesh>
      {/* flaps (hinged at the rim) — short end flaps sit just under the long ones */}
      <group ref={refs.front} position={[0, h + 0.004, d / 2 - T_WALL / 2]}>
        <mesh material={m.kraft} position={[0, FLAP / 2, 0]}>
          <boxGeometry args={[w, FLAP, T_WALL]} />
        </mesh>
      </group>
      <group ref={refs.back} position={[0, h + 0.004, -d / 2 + T_WALL / 2]}>
        <mesh material={m.kraft} position={[0, FLAP / 2, 0]}>
          <boxGeometry args={[w, FLAP, T_WALL]} />
        </mesh>
      </group>
      <group ref={refs.left} position={[-w / 2 + T_WALL / 2, h - 0.004, 0]}>
        <mesh material={m.kraft} position={[0, FLAP * 0.9 / 2, 0]}>
          <boxGeometry args={[T_WALL, FLAP * 0.9, d - 0.01]} />
        </mesh>
      </group>
      <group ref={refs.right} position={[w / 2 - T_WALL / 2, h - 0.004, 0]}>
        <mesh material={m.kraft} position={[0, FLAP * 0.9 / 2, 0]}>
          <boxGeometry args={[T_WALL, FLAP * 0.9, d - 0.01]} />
        </mesh>
      </group>
      {/* tape: a strip that grows along the seam, with tabs folded over each end */}
      <mesh ref={refs.tape} geometry={tapeGeo} material={m.tape} position={[-w / 2 - 0.004, h + 0.0135, 0]} scale={[0.0001, 1, 1]} />
      <mesh ref={refs.tapeEndA} material={m.tape} position={[-w / 2 - 0.0035, h - 0.035, 0]} visible={false}>
        <boxGeometry args={[0.0025, 0.08, 0.05]} />
      </mesh>
      <mesh ref={refs.tapeEndB} material={m.tape} position={[w / 2 + 0.0035, h - 0.035, 0]} visible={false}>
        <boxGeometry args={[0.0025, 0.08, 0.05]} />
      </mesh>
      {/* tape gun */}
      <group ref={refs.gun} visible={false}>
        <mesh material={m.navy} position={[-0.05, 0.11, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.04, 0.17, 0.035]} />
        </mesh>
        <mesh material={m.tape} position={[0.02, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.05, 28]} />
        </mesh>
        <mesh material={m.darkSteel} position={[0.02, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.056, 16]} />
        </mesh>
        <mesh material={m.darkSteel} position={[0.075, 0.02, 0]}>
          <boxGeometry args={[0.03, 0.012, 0.06]} />
        </mesh>
      </group>
      {/* shipping label on the front face */}
      <mesh ref={refs.label} material={m.label} position={[0.06, h * 0.5, d / 2 + 0.002]} scale={0.0001}>
        <planeGeometry args={[0.24, 0.16]} />
      </mesh>
      {/* products that get picked into the box */}
      {[
        { geo: <boxGeometry args={[0.17, 0.11, 0.12]} />, mat: productMats[0] },
        { geo: <boxGeometry args={[0.12, 0.16, 0.09]} />, mat: productMats[2] },
        { geo: <cylinderGeometry args={[0.045, 0.045, 0.19, 24]} />, mat: productMats[1] },
        { geo: <boxGeometry args={[0.2, 0.02, 0.14]} />, mat: productMats[3] },
      ].map((it, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (refs.items.current) refs.items.current[i] = el
          }}
          material={it.mat}
        >
          {it.geo}
        </mesh>
      ))}
    </group>
  )
}

/** Where each product sits on the table, and where it ends up inside the box (parcel-local). */
export const ITEM_START: [number, number, number][] = [
  [-0.5, 0.055, 0.12],
  [-0.56, 0.08, -0.12],
  [-0.74, 0.095, 0.06],
  [-0.38, 0.01, -0.24],
]
export const ITEM_END: [number, number, number][] = [
  [-0.12, 0.065, 0.06],
  [0.13, 0.09, -0.07],
  [0.14, 0.105, 0.09],
  [0, 0.25, 0],
]

/* ------------------------------------------------------------------ */
/* Packing bench                                                       */
/* ------------------------------------------------------------------ */
export function PackingTable({ m }: { m: Mats }) {
  const top = TABLE_TOP
  return (
    <group position={TABLE.toArray()}>
      <mesh material={m.tabletop} position={[0, top - 0.025, 0]}>
        <boxGeometry args={[1.9, 0.05, 0.8]} />
      </mesh>
      {[-0.88, 0.88].flatMap((x) =>
        [-0.34, 0.34].map((z) => (
          <mesh key={`${x}${z}`} material={m.darkSteel} position={[x, (top - 0.05) / 2, z]}>
            <boxGeometry args={[0.05, top - 0.05, 0.05]} />
          </mesh>
        )),
      )}
      <mesh material={m.darkSteel} position={[0, 0.22, 0]}>
        <boxGeometry args={[1.8, 0.03, 0.72]} />
      </mesh>
      {/* flat-packed boxes on the shelf */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} material={m.kraft} position={[-0.25 + i * 0.01, 0.245 + i * 0.012, 0]} rotation={[0, i * 0.03, 0]}>
          <boxGeometry args={[1.1, 0.01, 0.62]} />
        </mesh>
      ))}
      {/* label printer */}
      <group position={[0.7, top, -0.22]}>
        <mesh material={m.white} position={[0, 0.08, 0]}>
          <boxGeometry args={[0.22, 0.16, 0.26]} />
        </mesh>
        <mesh material={m.navy} position={[0, 0.162, 0.02]}>
          <boxGeometry args={[0.2, 0.01, 0.16]} />
        </mesh>
      </group>
      {/* spare tape roll */}
      <mesh material={m.tape} position={[0.62, top + 0.025, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.022, 10, 24]} />
      </mesh>
      {/* overhead light bar */}
      <mesh material={m.darkSteel} position={[0, 2.2, 0]}>
        <boxGeometry args={[1.6, 0.04, 0.12]} />
      </mesh>
      <mesh position={[0, 2.175, 0]}>
        <boxGeometry args={[1.5, 0.01, 0.08]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff6e0" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Pallet + carton stack (single, non-instanced; used on the forks)    */
/* ------------------------------------------------------------------ */
export const PALLET_H = 0.14
export const STACK_H = 0.95
export const HERO_STACK_H = 0.7

export function PalletLoad({ m, stackH = STACK_H }: { m: Mats; stackH?: number }) {
  return (
    <group>
      <PalletBase m={m} />
      <mesh material={m.stack} position={[0, PALLET_H + stackH / 2, 0]}>
        <boxGeometry args={[0.96, stackH, 1.16]} />
      </mesh>
    </group>
  )
}

function PalletBase({ m }: { m: Mats }) {
  return (
    <group>
      <mesh material={m.wood} position={[0, PALLET_H - 0.012, 0]}>
        <boxGeometry args={[1.0, 0.024, 1.2]} />
      </mesh>
      {[-0.42, 0, 0.42].map((x) => (
        <mesh key={x} material={m.wood} position={[x, (PALLET_H - 0.024) / 2, 0]}>
          <boxGeometry args={[0.12, PALLET_H - 0.024, 1.2]} />
        </mesh>
      ))}
    </group>
  )
}

/** Merged geometry for instancing many pallet loads (two draw calls total). */
export function useCargoGeometries() {
  return useMemo(() => {
    const stack = new THREE.BoxGeometry(0.96, STACK_H, 1.16)
    stack.translate(0, PALLET_H + STACK_H / 2, 0)
    const base = new THREE.BoxGeometry(1.0, PALLET_H, 1.2)
    base.translate(0, PALLET_H / 2, 0)
    return { stack, base }
  }, [])
}

/* ------------------------------------------------------------------ */
/* Counterbalance forklift (faces +z, origin between the wheels)       */
/* ------------------------------------------------------------------ */
export const FORK_PALLET_Z = 1.42

export type ForkliftRefs = { root: G; carriage: G; beacon: M; load: G }

export function Forklift({ refs, m, children }: { refs: ForkliftRefs; m: Mats; children?: React.ReactNode }) {
  return (
    <group ref={refs.root}>
      <mesh material={m.blob} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.1]}>
        <planeGeometry args={[2.0, 3.6]} />
      </mesh>
      {/* chassis */}
      <mesh material={m.amber} position={[0, 0.5, -0.25]}>
        <boxGeometry args={[1.1, 0.7, 1.7]} />
      </mesh>
      {/* counterweight */}
      <mesh material={m.darkSteel} position={[0, 0.72, -1.0]}>
        <boxGeometry args={[1.12, 0.95, 0.42]} />
      </mesh>
      {/* seat + steering */}
      <mesh material={m.navy} position={[0, 1.02, -0.45]}>
        <boxGeometry args={[0.5, 0.12, 0.45]} />
      </mesh>
      <mesh material={m.navy} position={[0, 1.3, -0.66]}>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
      </mesh>
      <mesh material={m.black} position={[0, 1.25, 0.18]} rotation={[-0.9, 0, 0]}>
        <torusGeometry args={[0.16, 0.022, 8, 20]} />
      </mesh>
      {/* overhead guard */}
      {[-0.5, 0.5].flatMap((x) =>
        [-0.85, 0.42].map((z) => (
          <mesh key={`${x}${z}`} material={m.black} position={[x, 1.5, z]}>
            <boxGeometry args={[0.06, 1.4, 0.06]} />
          </mesh>
        )),
      )}
      <mesh material={m.black} position={[0, 2.2, -0.21]}>
        <boxGeometry args={[1.08, 0.06, 1.38]} />
      </mesh>
      <mesh ref={refs.beacon} material={m.beacon} position={[0.42, 2.28, -0.8]}>
        <sphereGeometry args={[0.06, 12, 10]} />
      </mesh>
      {/* wheels */}
      {[
        [-0.5, 0.3, 0.35, 0.3],
        [0.5, 0.3, 0.35, 0.3],
        [-0.5, 0.24, -0.82, 0.24],
        [0.5, 0.24, -0.82, 0.24],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} material={m.rubber} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, 0.24, 20]} />
        </mesh>
      ))}
      {/* mast */}
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} material={m.darkSteel} position={[x, 1.25, 0.66]}>
          <boxGeometry args={[0.09, 2.4, 0.12]} />
        </mesh>
      ))}
      <mesh material={m.darkSteel} position={[0, 2.42, 0.66]}>
        <boxGeometry args={[0.82, 0.08, 0.12]} />
      </mesh>
      {/* carriage + forks (moves up and down) */}
      <group ref={refs.carriage}>
        <mesh material={m.darkSteel} position={[0, 0.35, 0.76]}>
          <boxGeometry args={[0.9, 0.55, 0.06]} />
        </mesh>
        {[-0.26, 0.26].map((x) => (
          <mesh key={x} material={m.darkSteel} position={[x, 0.04, 1.36]}>
            <boxGeometry args={[0.11, 0.05, 1.2]} />
          </mesh>
        ))}
        <group ref={refs.load} position={[0, 0.07, FORK_PALLET_Z]}>
          {children}
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Articulated curtain-side lorry (rear at z = 0, cab towards +z)      */
/* ------------------------------------------------------------------ */
export type LorryRefs = { root: G; doorL: G; doorR: G; curtainL: G; curtainR: G; body: G; token: G; shadow: M }

const TR_L = 13.6
const TR_W = 2.55
const TR_H = 2.75

export function Lorry({ refs, m }: { refs: LorryRefs; m: Mats }) {
  const geo = useMemo(() => {
    const curtainLeft = new THREE.PlaneGeometry(TR_L - 0.25, TR_H - 0.1)
    curtainLeft.translate(-(TR_L - 0.25) / 2, 0, 0)
    const curtainRight = new THREE.PlaneGeometry(TR_L - 0.25, TR_H - 0.1)
    curtainRight.translate((TR_L - 0.25) / 2, 0, 0)
    const doorL = new THREE.BoxGeometry(TR_W / 2 - 0.02, TR_H - 0.1, 0.05)
    doorL.translate((TR_W / 2 - 0.02) / 2, 0, 0)
    const doorR = new THREE.BoxGeometry(TR_W / 2 - 0.02, TR_H - 0.1, 0.05)
    doorR.translate(-(TR_W / 2 - 0.02) / 2, 0, 0)
    return { curtainLeft, curtainRight, doorL, doorR }
  }, [])
  const y0 = DOCK_H
  const wheel = (x: number, z: number, r = 0.5, key?: string) => (
    <mesh key={key} material={m.rubber} position={[x, r, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[r, r, 0.5, 18]} />
    </mesh>
  )
  return (
    <group ref={refs.root}>
      {/* map pin shown under the lorry once we've zoomed out to the UK */}
      <group ref={refs.token} position={[0, 0.6, 8]} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[7, 28]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
          <circleGeometry args={[5.6, 28]} />
          <meshBasicMaterial color={BRAND.signal} />
        </mesh>
      </group>
      <group ref={refs.body}>
        <mesh ref={refs.shadow} material={m.groundBlob} renderOrder={GROUND.shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 8.2]}>
          <planeGeometry args={[4.2, 18.5]} />
        </mesh>
        {/* trailer bed + chassis */}
        <mesh material={m.darkSteel} position={[0, y0 - 0.07, TR_L / 2]}>
          <boxGeometry args={[TR_W, 0.14, TR_L]} />
        </mesh>
        <mesh material={m.black} position={[0, y0 - 0.38, TR_L / 2]}>
          <boxGeometry args={[1.1, 0.42, TR_L - 0.4]} />
        </mesh>
        {[2.0, 3.35, 4.7].flatMap((z) => [wheel(-0.98, z, 0.5, `l${z}`), wheel(0.98, z, 0.5, `r${z}`)])}
        {/* rear bumper + lights */}
        <mesh material={m.darkSteel} position={[0, 0.55, 0.15]}>
          <boxGeometry args={[2.3, 0.12, 0.1]} />
        </mesh>
        {[-1.05, 1.05].map((x) => (
          <mesh key={x} position={[x, 0.75, 0.02]}>
            <boxGeometry args={[0.28, 0.12, 0.04]} />
            <meshStandardMaterial color="#c4161c" emissive="#7a0b0f" emissiveIntensity={0.6} />
          </mesh>
        ))}
        {/* box frame: roof, headboard, rear posts and rails */}
        <mesh material={m.white} position={[0, y0 + TR_H, TR_L / 2]}>
          <boxGeometry args={[TR_W + 0.04, 0.09, TR_L]} />
        </mesh>
        <mesh material={m.white} position={[0, y0 + TR_H / 2, TR_L - 0.04]}>
          <boxGeometry args={[TR_W, TR_H, 0.08]} />
        </mesh>
        {[-TR_W / 2 + 0.05, TR_W / 2 - 0.05].map((x) => (
          <group key={x}>
            <mesh material={m.white} position={[x, y0 + TR_H / 2, 0.06]}>
              <boxGeometry args={[0.1, TR_H, 0.12]} />
            </mesh>
            <mesh material={m.darkSteel} position={[x, y0 + 0.12, TR_L / 2]}>
              <boxGeometry args={[0.08, 0.1, TR_L]} />
            </mesh>
          </group>
        ))}
        <mesh material={m.white} position={[0, y0 + TR_H - 0.1, 0.06]}>
          <boxGeometry args={[TR_W, 0.2, 0.12]} />
        </mesh>
        {/* curtains (slide towards the headboard when open) */}
        <group ref={refs.curtainL} position={[-TR_W / 2 - 0.01, y0 + TR_H / 2 + 0.02, TR_L - 0.12]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh geometry={geo.curtainLeft} material={m.curtain} />
        </group>
        <group ref={refs.curtainR} position={[TR_W / 2 + 0.01, y0 + TR_H / 2 + 0.02, TR_L - 0.12]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={geo.curtainRight} material={m.curtain} />
        </group>
        {/* rear doors */}
        <group ref={refs.doorL} position={[-TR_W / 2 + 0.01, y0 + TR_H / 2, 0.0]}>
          <mesh geometry={geo.doorL} material={m.white} />
        </group>
        <group ref={refs.doorR} position={[TR_W / 2 - 0.01, y0 + TR_H / 2, 0.0]}>
          <mesh geometry={geo.doorR} material={m.white} />
        </group>
        {/* landing legs */}
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} material={m.darkSteel} position={[x, 0.6, 11.4]}>
            <boxGeometry args={[0.08, 1.0, 0.08]} />
          </mesh>
        ))}
        {/* tractor unit */}
        <mesh material={m.black} position={[0, 0.85, 14.0]}>
          <boxGeometry args={[1.0, 0.4, 5.0]} />
        </mesh>
        {wheel(-1.0, 12.7, 0.52, 'dl')}
        {wheel(1.0, 12.7, 0.52, 'dr')}
        {wheel(-1.0, 15.6, 0.52, 'sl')}
        {wheel(1.0, 15.6, 0.52, 'sr')}
        <group position={[0, 0, 15.25]}>
          <mesh material={m.white} position={[0, 2.35, 0]}>
            <boxGeometry args={[2.5, 2.7, 2.4]} />
          </mesh>
          <mesh material={m.navy} position={[0, 1.15, 0.02]}>
            <boxGeometry args={[2.52, 0.6, 2.42]} />
          </mesh>
          {/* roof deflector */}
          <mesh material={m.white} position={[0, 3.95, -0.35]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[2.4, 0.08, 1.6]} />
          </mesh>
          {/* windscreen + side windows */}
          <mesh material={m.glass} position={[0, 2.85, 1.205]}>
            <planeGeometry args={[2.2, 1.0]} />
          </mesh>
          {[-1.255, 1.255].map((x) => (
            <mesh key={x} material={m.glass} position={[x, 2.9, 0.65]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
              <planeGeometry args={[0.8, 0.8]} />
            </mesh>
          ))}
          {/* grille, bumper, lights */}
          <mesh material={m.darkSteel} position={[0, 1.75, 1.21]}>
            <planeGeometry args={[1.5, 0.75]} />
          </mesh>
          <mesh material={m.navy} position={[0, 0.75, 1.15]}>
            <boxGeometry args={[2.52, 0.35, 0.25]} />
          </mesh>
          {[-0.95, 0.95].map((x) => (
            <mesh key={x} position={[x, 0.95, 1.29]}>
              <boxGeometry args={[0.32, 0.12, 0.02]} />
              <meshStandardMaterial color="#fff8e6" emissive="#fff1c9" emissiveIntensity={1.2} />
            </mesh>
          ))}
          {/* signal stripe */}
          <mesh material={m.signal} position={[0, 1.55, 0]}>
            <boxGeometry args={[2.53, 0.12, 2.43]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Warehouse, yard and surroundings                                    */
/* ------------------------------------------------------------------ */
const WH = { x0: -32, x1: 32, z0: -38, z1: 0, h: 11.5 }
const DOOR_W = 3.1
const DOOR_H = 3.3

function signTexture() {
  return canvasTexture('sign', 1024, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 112px Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('DEPOXPRESS', 24, h / 2 + 4)
    const mw = ctx.measureText('DEPOXPRESS ').width
    ctx.fillStyle = '#8fb0ff'
    ctx.fillText('UK', 24 + mw, h / 2 + 4)
  })
}

export function Warehouse({ m }: { m: Mats }) {
  const width = WH.x1 - WH.x0
  const depth = WH.z1 - WH.z0
  const cx = (WH.x0 + WH.x1) / 2
  const cz = (WH.z0 + WH.z1) / 2

  // dock face: piers between the door openings
  const piers: { x: number; w: number }[] = []
  let cursor = WH.x0
  for (const bx of BAY_X) {
    const left = bx - DOOR_W / 2
    piers.push({ x: (cursor + left) / 2, w: left - cursor })
    cursor = bx + DOOR_W / 2
  }
  piers.push({ x: (cursor + WH.x1) / 2, w: WH.x1 - cursor })

  return (
    <group>
      {/* dock slab with polished floor */}
      <mesh material={m.concrete} position={[cx, (DOCK_H - 0.03) / 2, cz]}>
        <boxGeometry args={[width, DOCK_H - 0.03, depth]} />
      </mesh>
      <mesh material={m.floor} position={[cx, DOCK_H, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      {/* walkway lines */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} material={m.walkway} position={[x, DOCK_H + 0.01, -16]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 28]} />
        </mesh>
      ))}
      {/* dock face wall */}
      {piers.map((p, i) => (
        <mesh key={i} material={m.dockWall} position={[p.x, DOCK_H + DOOR_H / 2, 0.1]}>
          <boxGeometry args={[p.w, DOOR_H, 0.2]} />
        </mesh>
      ))}
      <mesh material={m.dockWall} position={[cx, DOCK_H + DOOR_H + (WH.h - DOOR_H - DOCK_H) / 2, 0.1]}>
        <boxGeometry args={[width, WH.h - DOOR_H - DOCK_H, 0.2]} />
      </mesh>
      <mesh material={m.dockBand} position={[cx, WH.h - 0.9, 0.22]}>
        <boxGeometry args={[width, 1.8, 0.05]} />
      </mesh>
      <mesh material={m.sign} position={[cx - 6, WH.h - 0.9, 0.26]}>
        <planeGeometry args={[11, 1.72]} />
      </mesh>
      {/* dock bumpers, levellers and door frames */}
      {BAY_X.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-1.25, 1.25].map((dx) => (
            <mesh key={dx} material={m.black} position={[dx, DOCK_H - 0.3, 0.32]}>
              <boxGeometry args={[0.25, 0.4, 0.22]} />
            </mesh>
          ))}
          <mesh material={m.leveller} position={[0, DOCK_H + 0.015, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 0.6]} />
          </mesh>
          <mesh material={m.dockBand} position={[0, DOCK_H + DOOR_H + 0.1, 0.24]}>
            <boxGeometry args={[DOOR_W + 0.3, 0.2, 0.1]} />
          </mesh>
          {/* roller door, rolled up */}
          <mesh material={m.darkSteel} position={[0, DOCK_H + DOOR_H - 0.2, -0.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, DOOR_W, 14]} />
          </mesh>
          {/* bay number */}
          <mesh position={[0, DOCK_H + DOOR_H + 0.55, 0.23]}>
            <planeGeometry args={[0.7, 0.5]} />
            <meshBasicMaterial color={x === 0 ? BRAND.signal : '#ffffff'} />
          </mesh>
        </group>
      ))}
      {/* back + side walls */}
      <mesh material={m.cladding} position={[cx, WH.h / 2, WH.z0]}>
        <boxGeometry args={[width, WH.h, 0.2]} />
      </mesh>
      {[WH.x0, WH.x1].map((x) => (
        <mesh key={x} material={m.cladding} position={[x, WH.h / 2, cz]}>
          <boxGeometry args={[0.2, WH.h, depth]} />
        </mesh>
      ))}
      {/* roof with ridge + rooflights */}
      <mesh material={m.roof} position={[cx, WH.h + 0.1, cz]}>
        <boxGeometry args={[width + 0.6, 0.2, depth + 0.6]} />
      </mesh>
      {[-24, -12, 0, 12, 24].map((x) => (
        <mesh key={x} position={[x, WH.h + 0.21, cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, depth - 6]} />
          <meshStandardMaterial color="#e9f1fb" roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
      {/* interior racking */}
      <Racks m={m} />
      {/* parked forklift chargers / clutter: a few pallets near the doors */}
    </group>
  )
}

function Racks({ m }: { m: Mats }) {
  const rows = [-30, -25.5, -21, -16.5]
  const bays = 9
  const bayW = 2.8
  const levels = [0, 1.6, 3.2, 4.8]
  const geo = useCargoGeometries()
  const { stackMesh, baseMesh } = useMemo(() => {
    const count = rows.length * 2 * bays * 2 * levels.length
    const stackMesh = new THREE.InstancedMesh(geo.stack, m.stack, count)
    const baseMesh = new THREE.InstancedMesh(geo.base, m.wood, count)
    const o = new THREE.Object3D()
    let i = 0
    // deterministic gaps so the racks look worked-in
    let s = 3
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
    for (const z of rows) {
      for (const side of [-1, 1]) {
        for (let b = 0; b < bays; b++) {
          for (const lv of levels) {
            for (const k of [0, 1]) {
              if (rnd() < 0.18) continue
              const x = (side < 0 ? -27 : 3.5) + b * bayW + k * 1.25 + 0.6
              o.position.set(x, DOCK_H + lv + 0.08, z)
              o.rotation.set(0, Math.PI / 2, 0)
              o.scale.set(1, 0.85 + rnd() * 0.15, 1)
              o.updateMatrix()
              stackMesh.setMatrixAt(i, o.matrix)
              baseMesh.setMatrixAt(i, o.matrix)
              i++
            }
          }
        }
      }
    }
    stackMesh.count = i
    baseMesh.count = i
    return { stackMesh, baseMesh }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, m])

  return (
    <group>
      <primitive object={stackMesh} />
      <primitive object={baseMesh} />
      {rows.flatMap((z) =>
        [-1, 1].map((side) => {
          const x0 = side < 0 ? -27 : 3.5
          const len = bays * bayW
          return (
            <group key={`${z}${side}`} position={[x0 + len / 2, DOCK_H, z]}>
              {Array.from({ length: bays + 1 }, (_, b) =>
                [-0.55, 0.55].map((dz) => (
                  <mesh key={`${b}${dz}`} material={m.rack} position={[-len / 2 + b * bayW, 3.3, dz]}>
                    <boxGeometry args={[0.08, 6.6, 0.08]} />
                  </mesh>
                )),
              )}
              {[1.55, 3.15, 4.75].flatMap((y) =>
                [-0.55, 0.55].map((dz) => (
                  <mesh key={`${y}${dz}`} material={m.beam} position={[0, y, dz]}>
                    <boxGeometry args={[len, 0.1, 0.06]} />
                  </mesh>
                )),
              )}
            </group>
          )
        }),
      )}
    </group>
  )
}

export function Yard({ m }: { m: Mats }) {
  const trees = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < 26; i++) {
      const t = i / 26
      const x = -48 + ((i * 37) % 96)
      const z = -50 + ((i * 53) % 150)
      if (Math.abs(x) < 40 && z > -42 && z < 95) continue
      pts.push([x, 0, z])
    }
    for (let i = 0; i < 18; i++) {
      pts.push([i % 2 ? -46 : 46, 0, -40 + i * 7.5])
    }
    void m
    return pts
  }, [m])

  return (
    <group>
      {/* yard apron */}
      <mesh material={m.asphalt} renderOrder={GROUND.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 46]}>
        <planeGeometry args={[100, 92]} />
      </mesh>
      {/* service road around the building */}
      <mesh material={m.asphalt} renderOrder={GROUND.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -19]}>
        <planeGeometry args={[80, 42]} />
      </mesh>
      {/* bay lines */}
      {[...BAY_X.map((x) => x - 4), BAY_X[BAY_X.length - 1] + 4].map((x) => (
        <mesh key={x} material={m.paint} renderOrder={GROUND.paint} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 10]}>
          <planeGeometry args={[0.18, 20]} />
        </mesh>
      ))}
      <mesh material={m.paint} renderOrder={GROUND.paint} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 20.2]}>
        <planeGeometry args={[60, 0.2]} />
      </mesh>
      {/* access road heading south to the main road */}
      <mesh material={m.asphalt} renderOrder={GROUND.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 260]}>
        <planeGeometry args={[14, 340]} />
      </mesh>
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i} material={m.paint} renderOrder={GROUND.paint} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 100 + i * 14]}>
          <planeGeometry args={[0.18, 6]} />
        </mesh>
      ))}
      {/* trees */}
      {trees.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} scale={0.8 + ((i * 7) % 5) * 0.12}>
          <mesh material={m.trunk} position={[0, 1, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 2, 6]} />
          </mesh>
          <mesh material={m.tree} position={[0, 3.4, 0]}>
            <icosahedronGeometry args={[1.8, 0]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export { PalletBase }
