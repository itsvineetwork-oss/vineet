"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

// Keep travel on wall-clock time even when frames are slow (weak GPUs, background tabs).
gsap.ticker.lagSmoothing(0);
import { rooms, roomZ, ROOM_W, ROOM_D, EYE, artworkById } from "@/data/gallery";
import { useGallery } from "@/store";

const SPEED = 4.2;
const WALL = 0.7;
const CORR = 1.3;
const LOOK = 0.0022;

function allowed(x: number, z: number) {
  const zMax = roomZ(0) + ROOM_D / 2 - WALL;
  const zMin = roomZ(rooms.length - 1) - ROOM_D / 2 + WALL;
  if (z > zMax || z < zMin) return false;
  for (const r of rooms) {
    if (Math.abs(z - roomZ(r.index)) <= ROOM_D / 2 - 0.35) return Math.abs(x) < ROOM_W / 2 - WALL;
  }
  return Math.abs(x) < CORR;
}

function nearestRoom(z: number) {
  let best = 0, d = Infinity;
  for (const r of rooms) { const dd = Math.abs(z - roomZ(r.index)); if (dd < d) { d = dd; best = r.index; } }
  return best;
}

export default function Player() {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const pitch = useRef(0);
  const vel = useRef(new THREE.Vector3());
  const bob = useRef(0);
  const ray = useRef(new THREE.Raycaster());
  const savedPose = useRef<{ x: number; y: number; z: number; yaw: number; pitch: number } | null>(null);
  const wheelAcc = useRef(0);
  const wheelLast = useRef(0);
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);

  camera.rotation.order = "YXZ";

  // ---- travel between rooms (scroll / plan / touch buttons)
  const travelTo = (index: number) => {
    const s = useGallery.getState();
    if (s.travelling || s.active) return;
    const i = Math.max(0, Math.min(rooms.length - 1, index));
    s.setTravelling(true);
    const target = { x: 0, z: roomZ(i) + ROOM_D / 2 - 3.5, yaw: 0, pitch: 0 };
    const from = { x: camera.position.x, z: camera.position.z, yaw: yaw.current, pitch: pitch.current };
    // shortest yaw path
    let dy = ((target.yaw - from.yaw + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (dy < -Math.PI) dy += Math.PI * 2;
    target.yaw = from.yaw + dy;
    const dist = Math.abs(target.z - from.z);
    gsap.to(from, {
      ...target,
      duration: Math.min(2.6, 1.1 + dist * 0.045),
      ease: "power3.inOut",
      onUpdate: () => {
        camera.position.x = from.x; camera.position.z = from.z;
        yaw.current = from.yaw; pitch.current = from.pitch;
      },
      onComplete: () => { s.setTravelling(false); s.setRoom(i); },
    });
  };

  // ---- open an artwork: dolly in front of it
  const openArtwork = (id: string) => {
    const s = useGallery.getState();
    const mesh = s.meshes.get(id);
    const art = artworkById.get(id);
    if (!mesh || !art || s.active || s.travelling) return;
    savedPose.current = { x: camera.position.x, y: camera.position.y, z: camera.position.z, yaw: yaw.current, pitch: pitch.current };
    if (document.pointerLockElement) document.exitPointerLock();
    s.setActive(id);
    s.setHover(null);
    const pos = new THREE.Vector3(); mesh.getWorldPosition(pos);
    const q = new THREE.Quaternion(); mesh.getWorldQuaternion(q);
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const d = THREE.MathUtils.clamp(art.size[0] * 0.75, 2.2, 4);
    const to = pos.clone().add(n.clone().multiplyScalar(d));
    // shift slightly left so the panel on the right does not cover the artwork
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    if (window.innerWidth > 700) to.add(right.multiplyScalar(art.size[0] * 0.22));
    const tYaw = Math.atan2(n.x, n.z);
    const tPitch = Math.atan2(pos.y - EYE, d) * 0.6;
    let dy = ((tYaw - yaw.current + Math.PI) % (Math.PI * 2)) - Math.PI; if (dy < -Math.PI) dy += Math.PI * 2;
    const from = { x: camera.position.x, z: camera.position.z, yaw: yaw.current, pitch: pitch.current };
    s.setTravelling(true);
    gsap.to(from, {
      x: to.x, z: to.z, yaw: yaw.current + dy, pitch: tPitch, duration: 1.3, ease: "power3.inOut",
      onUpdate: () => { camera.position.x = from.x; camera.position.z = from.z; yaw.current = from.yaw; pitch.current = from.pitch; },
      onComplete: () => s.setTravelling(false),
    });
  };

  const closeArtwork = () => {
    const s = useGallery.getState();
    const p = savedPose.current;
    if (!p) return;
    const from = { x: camera.position.x, z: camera.position.z, yaw: yaw.current, pitch: pitch.current };
    s.setTravelling(true);
    gsap.to(from, {
      x: p.x, z: p.z, yaw: p.yaw, pitch: p.pitch, duration: 1, ease: "power2.inOut",
      onUpdate: () => { camera.position.x = from.x; camera.position.z = from.z; yaw.current = from.yaw; pitch.current = from.pitch; },
      onComplete: () => s.setTravelling(false),
    });
  };

  useEffect(() => {
    const el = gl.domElement;
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      keys.current[e.code] = down;
      if (down && e.code === "Escape" && useGallery.getState().active) useGallery.getState().setActive(null);
    };
    const kd = onKey(true), ku = onKey(false);
    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement || useGallery.getState().active) return;
      yaw.current -= e.movementX * LOOK;
      pitch.current = THREE.MathUtils.clamp(pitch.current - e.movementY * LOOK, -1.2, 1.2);
    };
    const onLock = () => useGallery.getState().setLocked(document.pointerLockElement === el);
    const onClick = () => {
      const s = useGallery.getState();
      if (s.active || s.travelling) return;
      if (document.pointerLockElement === el) {
        if (s.hover) openArtwork(s.hover);
      } else if (s.entered && matchMedia("(pointer: fine)").matches) {
        // Defer so an artwork's own click handler (which opens a case study) runs first.
        setTimeout(() => { if (!useGallery.getState().active) el.requestPointerLock?.(); }, 0);
      }
    };
    const onWheel = (e: WheelEvent) => {
      const s = useGallery.getState();
      if (!s.entered || s.active || s.travelling) return;
      const now = performance.now();
      if (now - wheelLast.current > 400) wheelAcc.current = 0;
      wheelLast.current = now;
      wheelAcc.current += e.deltaY;
      if (Math.abs(wheelAcc.current) > 60) {
        travelTo(s.room + (wheelAcc.current > 0 ? 1 : -1));
        wheelAcc.current = 0;
      }
    };
    // touch: drag to look
    const onPD = (e: PointerEvent) => { if (e.pointerType === "touch" && !touch.current) touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; };
    const onPM = (e: PointerEvent) => {
      if (!touch.current || e.pointerId !== touch.current.id || useGallery.getState().active) return;
      yaw.current -= (e.clientX - touch.current.x) * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current - (e.clientY - touch.current.y) * 0.005, -1.2, 1.2);
      touch.current.x = e.clientX; touch.current.y = e.clientY;
    };
    const onPU = (e: PointerEvent) => { if (touch.current && e.pointerId === touch.current.id) touch.current = null; };

    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("pointerlockchange", onLock);
    el.addEventListener("click", onClick);
    window.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onPD);
    el.addEventListener("pointermove", onPM);
    el.addEventListener("pointerup", onPU);
    el.addEventListener("pointercancel", onPU);

    // store-driven requests
    const unsub = useGallery.subscribe((s, prev) => {
      if (s.goTo !== null && s.goTo !== prev.goTo) { const i = s.goTo; s.requestGoTo(null); travelTo(i); }
      if (prev.active && !s.active) closeArtwork();
      if (s.entered && !prev.entered && matchMedia("(pointer: fine)").matches) el.requestPointerLock?.();
    });

    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerlockchange", onLock);
      el.removeEventListener("click", onClick);
      window.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPD);
      el.removeEventListener("pointermove", onPM);
      el.removeEventListener("pointerup", onPU);
      el.removeEventListener("pointercancel", onPU);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = useGallery.getState();

    if (!s.travelling && !s.active && s.entered) {
      const k = keys.current;
      const f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
      const r = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
      const fwd = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
      const rgt = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
      const wish = fwd.multiplyScalar(f).add(rgt.multiplyScalar(r));
      if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(SPEED * (k.ShiftLeft ? 1.6 : 1));
      vel.current.lerp(wish, 1 - Math.exp(-dt * 10));

      const nx = camera.position.x + vel.current.x * dt;
      const nz = camera.position.z + vel.current.z * dt;
      if (allowed(nx, camera.position.z)) camera.position.x = nx; else vel.current.x = 0;
      if (allowed(camera.position.x, nz)) camera.position.z = nz; else vel.current.z = 0;

      const moving = vel.current.length() > 0.3;
      bob.current += dt * (moving ? 9 : 0);
      const targetY = EYE + (moving ? Math.sin(bob.current) * 0.035 : 0);
      camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 8);

      const room = nearestRoom(camera.position.z);
      if (room !== s.room) s.setRoom(room);

      // centre raycast for hover while pointer-locked
      if (s.locked) {
        ray.current.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = ray.current.intersectObjects([...s.meshes.values()], false);
        const hit = hits[0];
        s.setHover(hit && hit.distance < 7 ? (hit.object.userData.artworkId as string) : null);
      }
    }

    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
  });

  return null;
}
