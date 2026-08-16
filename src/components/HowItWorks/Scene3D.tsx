'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { FixKey, FixState } from './beats'

const COLOR_GROUND = '#a89c86'
const COLOR_SIDEWALK = '#cdc4b0'
const COLOR_POTHOLE = '#2b2420'
const COLOR_LAMP_OFF = '#4a4640'
const COLOR_AMBER = '#f2a93b'
const COLOR_INK = '#173a40'
const RIPPLE_DURATION = 1.1

interface SceneProps {
  fixed: FixState
  onSelect: (key: FixKey) => void
  reducedMotion: boolean
}

function useProgress(target: boolean, reducedMotion: boolean) {
  const progress = useRef(target ? 1 : 0)
  const rippleT = useRef(reducedMotion ? RIPPLE_DURATION : -1)
  const prevTarget = useRef(target)

  useFrame((_, delta) => {
    const goal = target ? 1 : 0
    if (reducedMotion) {
      progress.current = goal
    } else {
      progress.current += (goal - progress.current) * Math.min(1, delta * 4)
    }
    if (!prevTarget.current && target && !reducedMotion) {
      rippleT.current = 0
    }
    prevTarget.current = target
    if (rippleT.current >= 0 && rippleT.current < RIPPLE_DURATION) {
      rippleT.current += delta
    }
  })

  return { progress, rippleT }
}

function RippleRing({ rippleT, position }: { rippleT: React.RefObject<number>; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const t = rippleT.current
    if (t < 0 || t >= RIPPLE_DURATION) {
      mesh.visible = false
      return
    }
    mesh.visible = true
    const p = t / RIPPLE_DURATION
    const scale = 0.2 + p * 1.6
    mesh.scale.set(scale, scale, scale)
    const mat = mesh.material as THREE.MeshBasicMaterial
    mat.opacity = 0.7 * (1 - p)
  })
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.5, 0.6, 32]} />
      <meshBasicMaterial color={COLOR_AMBER} transparent opacity={0} />
    </mesh>
  )
}

function Pothole({ fixed, reducedMotion, onSelect }: { fixed: boolean; reducedMotion: boolean; onSelect: () => void }) {
  const { progress, rippleT } = useProgress(fixed, reducedMotion)
  const ref = useRef<THREE.Mesh>(null)
  const colorDark = new THREE.Color(COLOR_POTHOLE)
  const colorGround = new THREE.Color(COLOR_GROUND)

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const p = progress.current
    mesh.position.y = -0.05 + p * 0.05
    const mat = mesh.material as THREE.MeshStandardMaterial
    mat.color.copy(colorDark).lerp(colorGround, p)
  })

  return (
    <group position={[-1.6, 0, 0.9]}>
      <mesh ref={ref} onClick={onSelect}>
        <cylinderGeometry args={[0.58, 0.5, 0.1, 24]} />
        <meshStandardMaterial flatShading color={COLOR_POTHOLE} />
      </mesh>
      <RippleRing rippleT={rippleT} position={[0, 0.02, 0]} />
      <Html position={[0, 0.75, 0]} center distanceFactor={8} occlude={false}>
        <button
          onClick={onSelect}
          className="rounded-full bg-paper/90 px-2.5 py-1 font-display text-[11px] font-semibold text-ink shadow-(--shadow-soft) hover:bg-paper"
        >
          Pothole
        </button>
      </Html>
    </group>
  )
}

function Streetlight({ fixed, reducedMotion, onSelect }: { fixed: boolean; reducedMotion: boolean; onSelect: () => void }) {
  const { progress, rippleT } = useProgress(fixed, reducedMotion)
  const lampRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const colorOff = new THREE.Color(COLOR_LAMP_OFF)
  const colorOn = new THREE.Color(COLOR_AMBER)

  useFrame(() => {
    const p = progress.current
    const lamp = lampRef.current
    if (lamp) {
      const mat = lamp.material as THREE.MeshStandardMaterial
      mat.color.copy(colorOff).lerp(colorOn, p)
      mat.emissive.copy(colorOn)
      mat.emissiveIntensity = p * 1.4
    }
    if (lightRef.current) lightRef.current.intensity = p * 3.5
  })

  return (
    <group position={[1.4, 0, -0.6]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.6, 10]} />
        <meshStandardMaterial flatShading color={COLOR_INK} />
      </mesh>
      <mesh ref={lampRef} position={[0, 1.65, 0]} onClick={onSelect}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial flatShading color={COLOR_LAMP_OFF} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.65, 0]} color={COLOR_AMBER} intensity={0} distance={3} />
      <RippleRing rippleT={rippleT} position={[0, 0.02, 0]} />
      <Html position={[0, 2.1, 0]} center distanceFactor={8} occlude={false}>
        <button
          onClick={onSelect}
          className="rounded-full bg-paper/90 px-2.5 py-1 font-display text-[11px] font-semibold text-ink shadow-(--shadow-soft) hover:bg-paper"
        >
          Streetlight
        </button>
      </Html>
    </group>
  )
}

function WastePile({ fixed, reducedMotion, onSelect }: { fixed: boolean; reducedMotion: boolean; onSelect: () => void }) {
  const { progress, rippleT } = useProgress(fixed, reducedMotion)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    const scale = 1 - progress.current
    g.scale.set(scale, scale, scale)
  })

  const pieces: Array<{ pos: [number, number, number]; color: string; rot: number }> = [
    { pos: [-0.15, 0.1, 0.1], color: '#8a6d3b', rot: 0.4 },
    { pos: [0.15, 0.08, -0.05], color: '#4c7a5b', rot: 1.1 },
    { pos: [0, 0.16, 0], color: '#8a6d3b', rot: 2.0 },
  ]

  return (
    <group position={[0.1, 0, 1.5]}>
      <group ref={groupRef} onClick={onSelect}>
        {pieces.map((piece, i) => (
          <mesh key={i} position={piece.pos} rotation={[0.3, piece.rot, 0.2]}>
            <boxGeometry args={[0.28, 0.2, 0.24]} />
            <meshStandardMaterial flatShading color={piece.color} />
          </mesh>
        ))}
      </group>
      <RippleRing rippleT={rippleT} position={[0, 0.02, 0]} />
      <Html position={[0, 0.55, 0]} center distanceFactor={8} occlude={false}>
        <button
          onClick={onSelect}
          className="rounded-full bg-paper/90 px-2.5 py-1 font-display text-[11px] font-semibold text-ink shadow-(--shadow-soft) hover:bg-paper"
        >
          Waste
        </button>
      </Html>
    </group>
  )
}

function SceneContent({ fixed, onSelect, reducedMotion }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} color="#fff3e0" />

      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[6, 0.3, 4.4]} />
        <meshStandardMaterial flatShading color={COLOR_GROUND} />
      </mesh>
      <mesh position={[-2.4, -0.02, 0]}>
        <boxGeometry args={[1.2, 0.05, 4.4]} />
        <meshStandardMaterial flatShading color={COLOR_SIDEWALK} />
      </mesh>

      <mesh position={[-2.8, 0.9, -1.6]}>
        <boxGeometry args={[0.9, 1.8, 0.9]} />
        <meshStandardMaterial flatShading color="#7a94a0" />
      </mesh>
      <mesh position={[2.6, 0.6, -1.8]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshStandardMaterial flatShading color="#173a40" />
      </mesh>

      <Pothole fixed={fixed.pothole} reducedMotion={reducedMotion} onSelect={() => onSelect('pothole')} />
      <Streetlight fixed={fixed.streetlight} reducedMotion={reducedMotion} onSelect={() => onSelect('streetlight')} />
      <WastePile fixed={fixed.waste} reducedMotion={reducedMotion} onSelect={() => onSelect('waste')} />

      <OrbitControls
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.6}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.4}
      />
    </>
  )
}

export default function Scene3D(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [5.6, 4.9, 5.6], fov: 30 }}
      dpr={[1, 2]}
      className="!h-full !w-full"
      style={{ background: 'transparent' }}
    >
      <SceneContent {...props} />
    </Canvas>
  )
}
