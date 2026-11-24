"use client";

import { ROOM_D, GAP, roomZ } from "@/data/gallery";
import { ceilingMat, glass, brass, lightStrip, steel } from "./materials";
import { Stair } from "./Room";

const W = 3.2;
const H = 3.8;

/** The glass passage between room i and i+1. Narrow, low, bright: a compression before the next room opens. */
export default function Corridor({ index }: { index: number }) {
  const zStart = roomZ(index) - ROOM_D / 2;
  const zc = zStart - GAP / 2;
  return (
    <group position={[0, 0, zc]}>
      {/* glass sides */}
      <mesh position={[-W / 2, H / 2, 0]} material={glass}><boxGeometry args={[0.04, H, GAP]} /></mesh>
      <mesh position={[W / 2, H / 2, 0]} material={glass}><boxGeometry args={[0.04, H, GAP]} /></mesh>
      {/* brass rails top and bottom */}
      {[-W / 2, W / 2].map((x) => (
        <group key={x}>
          <mesh position={[x, H, 0]} material={brass}><boxGeometry args={[0.1, 0.06, GAP]} /></mesh>
          <mesh position={[x, 0.03, 0]} material={brass}><boxGeometry args={[0.1, 0.06, GAP]} /></mesh>
        </group>
      ))}
      {/* low ceiling with a continuous light slot */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMat}><planeGeometry args={[W, GAP]} /></mesh>
      <mesh position={[0, H - 0.02, 0]} material={lightStrip}><boxGeometry args={[0.25, 0.03, GAP]} /></mesh>
      <pointLight position={[0, H - 0.5, 0]} intensity={6} distance={10} decay={2} />
      {/* a stair outside the glass, going nowhere, inverted on the other side */}
      <Stair position={[W / 2 + 1.6, 0.14, 2]} rotation={[0, 0, 0]} steps={6} />
      <Stair position={[-W / 2 - 1.6, 3.2, 2]} rotation={[0, 0, Math.PI]} steps={6} />
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={steel}><planeGeometry args={[0.02, GAP]} /></mesh>
    </group>
  );
}
