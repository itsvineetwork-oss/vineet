"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { rooms, roomZ, ROOM_D, PITCH, EYE } from "@/data/gallery";
import Room from "./Room";
import Corridor from "./Corridor";
import Player from "./Player";

const FOG = "#e9e7e2";

function Floor() {
  const length = PITCH * rooms.length + 40;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -length / 2 + ROOM_D / 2 + 20]} receiveShadow>
      <planeGeometry args={[60, length]} />
      <MeshReflectorMaterial
        resolution={1024}
        mirror={0.35}
        blur={[400, 100]}
        mixBlur={0.9}
        mixStrength={1.6}
        depthScale={0.8}
        minDepthThreshold={0.85}
        color="#d9d7d2"
        roughness={0.55}
        metalness={0.15}
      />
    </mesh>
  );
}

export default function Experience() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: 68, near: 0.1, far: 220, position: [0, EYE, roomZ(0) + ROOM_D / 2 - 3] }}
    >
      <color attach="background" args={[FOG]} />
      <fog attach="fog" args={[FOG, 18, 90]} />

      <hemisphereLight args={["#ffffff", "#cfcbc3", 0.55]} />
      <directionalLight
        position={[8, 14, -20]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={60}
        shadow-camera-bottom={-100}
        shadow-camera-near={1}
        shadow-camera-far={80}
      />

      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, 0]} scale={[12, 12, 1]} />
          <Lightformer intensity={1} rotation-y={Math.PI / 2} position={[-6, 2, 0]} scale={[8, 3, 1]} />
          <Lightformer intensity={1} rotation-y={-Math.PI / 2} position={[6, 2, 0]} scale={[8, 3, 1]} />
          <Lightformer intensity={0.6} color="#d9c8a0" position={[0, 2, -8]} scale={[4, 2, 1]} />
        </Environment>

        <Floor />
        {rooms.map((r) => (
          <Room key={r.id} room={r} />
        ))}
        {rooms.slice(0, -1).map((r) => (
          <Corridor key={`c-${r.id}`} index={r.index} />
        ))}
        <Player />
      </Suspense>
    </Canvas>
  );
}
