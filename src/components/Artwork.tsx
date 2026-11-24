"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Artwork as ArtworkT } from "@/data/gallery";
import { artworkTexture } from "@/lib/textures";
import { useGallery } from "@/store";
import { brass, frameDark } from "./materials";

export default function Artwork({ artwork, accent }: { artwork: ArtworkT; accent: string }) {
  const group = useRef<THREE.Group>(null);
  const plane = useRef<THREE.Mesh>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const spotTarget = useRef<THREE.Object3D>(null);
  const register = useGallery((s) => s.register);
  const hover = useGallery((s) => s.hover === artwork.id);
  const [w, h] = artwork.size;

  const tex = useMemo(() => {
    if (artwork.image) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const t = new THREE.TextureLoader().load(base + artwork.image);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    }
    return artworkTexture({ id: artwork.id, title: artwork.title, subtitle: artwork.subtitle, lines: artwork.lines, accent, ratio: w / h });
  }, [artwork, accent, w, h]);

  useEffect(() => {
    if (spot.current && spotTarget.current) spot.current.target = spotTarget.current;
  }, []);

  useEffect(() => {
    register(artwork.id, plane.current);
    return () => register(artwork.id, null);
  }, [artwork.id, register]);

  const base = useMemo(() => new THREE.Vector3(...artwork.position), [artwork.position]);

  useFrame((s, dt) => {
    if (!group.current) return;
    const t = s.clock.elapsedTime;
    if (artwork.floating) {
      group.current.position.y = base.y + Math.sin(t * 0.6 + base.x) * 0.1;
      group.current.rotation.z = artwork.rotation[2] + Math.sin(t * 0.4) * 0.03;
    }
    const target = hover ? 1.03 : 1;
    const sc = group.current.scale.x + (target - group.current.scale.x) * Math.min(1, dt * 8);
    group.current.scale.setScalar(sc);
  });

  const b = 0.09; // frame bar
  return (
    <group ref={group} position={artwork.position} rotation={artwork.rotation}>
      {/* backing slab */}
      <mesh position={[0, 0, -0.03]} material={frameDark} castShadow>
        <boxGeometry args={[w + b * 2, h + b * 2, 0.06]} />
      </mesh>
      {/* brass bars */}
      <mesh position={[0, h / 2 + b / 2, 0]} material={brass}><boxGeometry args={[w + b * 2, b, 0.08]} /></mesh>
      <mesh position={[0, -h / 2 - b / 2, 0]} material={brass}><boxGeometry args={[w + b * 2, b, 0.08]} /></mesh>
      <mesh position={[-w / 2 - b / 2, 0, 0]} material={brass}><boxGeometry args={[b, h, 0.08]} /></mesh>
      <mesh position={[w / 2 + b / 2, 0, 0]} material={brass}><boxGeometry args={[b, h, 0.08]} /></mesh>
      {/* the artwork itself */}
      <mesh
        ref={plane}
        position={[0, 0, 0.01]}
        userData={{ artworkId: artwork.id }}
        onClick={(e) => {
          e.stopPropagation();
          const s = useGallery.getState();
          if (!s.locked && !s.travelling && e.distance < 9) s.setActive(artwork.id);
        }}
        onPointerOver={(e) => { if (!useGallery.getState().locked && e.distance < 9) useGallery.getState().setHover(artwork.id); }}
        onPointerOut={() => { if (!useGallery.getState().locked) useGallery.getState().setHover(null); }}
      >
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.7} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={hover ? 0.35 : 0.12} />
      </mesh>
      {/* picture light */}
      <mesh position={[0, h / 2 + 0.35, 0.3]} rotation={[0.6, 0, 0]} material={brass}>
        <boxGeometry args={[w * 0.6, 0.04, 0.12]} />
      </mesh>
      <object3D ref={spotTarget} position={[0, 0, 0]} />
      <spotLight ref={spot} position={[0, h / 2 + 0.3, 0.6]} angle={0.9} penumbra={0.8} intensity={4} distance={6} decay={2} color="#fff2dc" />
    </group>
  );
}
