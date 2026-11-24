"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM_W, ROOM_H, ROOM_D, roomZ, rooms, type Room as RoomT } from "@/data/gallery";
import { concrete, ceilingMat, glass, brass, steel, lightStrip, concreteDark } from "./materials";
import Artwork from "./Artwork";

const DOOR_W = 3.2;
const DOOR_H = 3.8;
const T = 0.3; // wall thickness

/** A wall on the Z axis with a central doorway. */
function DoorWall({ z, solid }: { z: number; solid: boolean }) {
  if (solid) {
    return (
      <mesh position={[0, ROOM_H / 2, z]} material={concrete} castShadow receiveShadow>
        <boxGeometry args={[ROOM_W + T, ROOM_H, T]} />
      </mesh>
    );
  }
  const side = (ROOM_W - DOOR_W) / 2;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-(DOOR_W / 2 + side / 2), ROOM_H / 2, 0]} material={concrete} castShadow receiveShadow>
        <boxGeometry args={[side + T / 2, ROOM_H, T]} />
      </mesh>
      <mesh position={[DOOR_W / 2 + side / 2, ROOM_H / 2, 0]} material={concrete} castShadow receiveShadow>
        <boxGeometry args={[side + T / 2, ROOM_H, T]} />
      </mesh>
      <mesh position={[0, DOOR_H + (ROOM_H - DOOR_H) / 2, 0]} material={concrete} castShadow receiveShadow>
        <boxGeometry args={[DOOR_W + 0.02, ROOM_H - DOOR_H, T]} />
      </mesh>
      {/* brass door reveal */}
      <mesh position={[0, DOOR_H, 0]} material={brass}>
        <boxGeometry args={[DOOR_W + 0.16, 0.08, T + 0.06]} />
      </mesh>
      <mesh position={[-DOOR_W / 2 - 0.04, DOOR_H / 2, 0]} material={brass}>
        <boxGeometry args={[0.08, DOOR_H, T + 0.06]} />
      </mesh>
      <mesh position={[DOOR_W / 2 + 0.04, DOOR_H / 2, 0]} material={brass}>
        <boxGeometry args={[0.08, DOOR_H, T + 0.06]} />
      </mesh>
    </group>
  );
}

/** An empty brass frame that hangs in the air and slowly turns. Pure atmosphere. */
function FloatingFrame({ position, size, speed = 0.15 }: { position: [number, number, number]; size: [number, number]; speed?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime;
    g.current.rotation.y = Math.sin(t * speed) * 0.6;
    g.current.rotation.z = Math.sin(t * speed * 0.7) * 0.12;
    g.current.position.y = position[1] + Math.sin(t * 0.5) * 0.12;
  });
  const [w, h] = size;
  const b = 0.07;
  return (
    <group ref={g} position={position}>
      <mesh position={[0, h / 2, 0]} material={brass} castShadow><boxGeometry args={[w + b * 2, b, b]} /></mesh>
      <mesh position={[0, -h / 2, 0]} material={brass} castShadow><boxGeometry args={[w + b * 2, b, b]} /></mesh>
      <mesh position={[-w / 2, 0, 0]} material={brass} castShadow><boxGeometry args={[b, h, b]} /></mesh>
      <mesh position={[w / 2, 0, 0]} material={brass} castShadow><boxGeometry args={[b, h, b]} /></mesh>
      <mesh material={glass}><planeGeometry args={[w, h]} /></mesh>
    </group>
  );
}

/** An Escher-style stair run: steps that climb a wall sideways or hang from the ceiling. */
export function Stair({ position, rotation = [0, 0, 0], steps = 7, mirror = false }: { position: [number, number, number]; rotation?: [number, number, number]; steps?: number; mirror?: boolean }) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.28 * (mirror ? -1 : 1), -i * 0.42]} material={concreteDark} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.28, 0.42]} />
        </mesh>
      ))}
      <mesh position={[0.86, steps * 0.14 * (mirror ? -1 : 1), -steps * 0.21]} rotation={[Math.atan2(0.28, 0.42) * (mirror ? -1 : 1), 0, 0]} material={steel}>
        <boxGeometry args={[0.03, 0.03, steps * 0.5]} />
      </mesh>
    </group>
  );
}

export default function Room({ room }: { room: RoomT }) {
  const z = roomZ(room.index);
  const first = room.index === 0;
  const last = room.index === rooms.length - 1;

  return (
    <group position={[0, 0, z]}>
      {/* side walls */}
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} material={concrete} castShadow receiveShadow>
        <boxGeometry args={[T, ROOM_H, ROOM_D]} />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} material={concrete} castShadow receiveShadow>
        <boxGeometry args={[T, ROOM_H, ROOM_D]} />
      </mesh>
      {/* front (+z) and back (-z) walls */}
      <DoorWall z={ROOM_D / 2} solid={first} />
      <DoorWall z={-ROOM_D / 2} solid={last} />

      {/* ceiling with a light slot */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMat}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
      </mesh>
      <mesh position={[0, ROOM_H - 0.02, 0]} material={lightStrip}>
        <boxGeometry args={[0.6, 0.04, ROOM_D - 3]} />
      </mesh>
      <pointLight position={[0, ROOM_H - 0.8, 0]} intensity={18} distance={22} decay={2} color="#fff4e2" />
      <pointLight position={[0, ROOM_H - 1, -ROOM_D / 2 + 3]} intensity={10} distance={14} decay={2} color="#ffffff" />

      {/* skirting in steel */}
      <mesh position={[-ROOM_W / 2 + T / 2 + 0.02, 0.06, 0]} material={steel}><boxGeometry args={[0.04, 0.12, ROOM_D]} /></mesh>
      <mesh position={[ROOM_W / 2 - T / 2 - 0.02, 0.06, 0]} material={steel}><boxGeometry args={[0.04, 0.12, ROOM_D]} /></mesh>

      {/* a glass partition with a brass edge, offset to one side */}
      <group position={[room.index % 2 ? 3.5 : -3.5, 0, 2]}>
        <mesh position={[0, 2.2, 0]} material={glass}><boxGeometry args={[0.04, 4.4, 5]} /></mesh>
        <mesh position={[0, 4.42, 0]} material={brass}><boxGeometry args={[0.08, 0.04, 5]} /></mesh>
        <mesh position={[0, 0.02, 0]} material={brass}><boxGeometry args={[0.08, 0.04, 5]} /></mesh>
      </group>

      {/* Escher: a stair run climbing the side wall, and its mirror hanging from the ceiling */}
      <Stair position={[room.index % 2 ? -ROOM_W / 2 + 1.1 : ROOM_W / 2 - 1.1, 0.14, 7]} rotation={[0, room.index % 2 ? 0 : Math.PI, 0]} />
      <Stair position={[room.index % 2 ? ROOM_W / 2 - 1.1 : -ROOM_W / 2 + 1.1, ROOM_H - 0.2, 7]} rotation={[0, room.index % 2 ? Math.PI : 0, 0]} mirror steps={6} />

      {/* a floating empty frame in the air */}
      <FloatingFrame position={[room.index % 2 ? -4 : 4, 3.4, -2]} size={[2.2, 1.5]} speed={0.12 + room.index * 0.02} />

      {/* a plinth with the room number */}
      <mesh position={[room.index % 2 ? 5 : -5, 0.5, 5.5]} material={concreteDark} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh position={[room.index % 2 ? 5 : -5, 1.02, 5.5]} material={brass}>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
      </mesh>

      {room.artworks.map((a) => (
        <Artwork key={a.id} artwork={a} accent={room.accent} />
      ))}
    </group>
  );
}
