import { create } from "zustand";
import type { Object3D } from "three";

type State = {
  entered: boolean;
  locked: boolean;
  /** False once pointer lock is known to be unavailable (embedded frames, some browsers). */
  lockOK: boolean;
  room: number;
  travelling: boolean;
  hover: string | null;
  active: string | null;
  meshes: Map<string, Object3D>;
  setEntered: (v: boolean) => void;
  setLocked: (v: boolean) => void;
  setLockOK: (v: boolean) => void;
  setRoom: (i: number) => void;
  setTravelling: (v: boolean) => void;
  setHover: (id: string | null) => void;
  setActive: (id: string | null) => void;
  register: (id: string, o: Object3D | null) => void;
  /** Request a cinematic travel to a room index; consumed by the Player. */
  goTo: number | null;
  requestGoTo: (i: number | null) => void;
};

export const useGallery = create<State>((set, get) => ({
  entered: false,
  locked: false,
  lockOK: true,
  room: 0,
  travelling: false,
  hover: null,
  active: null,
  meshes: new Map(),
  goTo: null,
  setEntered: (entered) => set({ entered }),
  setLocked: (locked) => set({ locked }),
  setLockOK: (lockOK) => set({ lockOK }),
  setRoom: (room) => set({ room }),
  setTravelling: (travelling) => set({ travelling }),
  setHover: (hover) => { if (get().hover !== hover) set({ hover }); },
  setActive: (active) => set({ active }),
  register: (id, o) => {
    const m = get().meshes;
    if (o) m.set(id, o); else m.delete(id);
  },
  requestGoTo: (goTo) => set({ goTo }),
}));

if (typeof window !== "undefined") (window as unknown as { __gallery: typeof useGallery }).__gallery = useGallery;
