import * as THREE from "three";

export const concrete = new THREE.MeshStandardMaterial({ color: "#e8e6e1", roughness: 0.95, metalness: 0 });
export const concreteDark = new THREE.MeshStandardMaterial({ color: "#d6d3cc", roughness: 0.9, metalness: 0 });
export const ceilingMat = new THREE.MeshStandardMaterial({ color: "#f2f0eb", roughness: 1, metalness: 0, emissive: "#ffffff", emissiveIntensity: 0.32 });
export const glass = new THREE.MeshPhysicalMaterial({
  color: "#dfe8ea", transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1,
  side: THREE.DoubleSide, depthWrite: false,
});
export const brass = new THREE.MeshStandardMaterial({ color: "#b89a62", metalness: 1, roughness: 0.28 });
export const steel = new THREE.MeshStandardMaterial({ color: "#aeb3b8", metalness: 1, roughness: 0.2 });
export const lightStrip = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff6e6", emissiveIntensity: 2.2, roughness: 1 });
export const frameDark = new THREE.MeshStandardMaterial({ color: "#1d1f22", roughness: 0.6, metalness: 0.2 });
