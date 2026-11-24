import gsap from "gsap";
import type { Stroke } from "./sketch";
import { Pencil } from "./pencil";
import { scratch } from "./sound";

export type DrawOpts = {
  /** Drawing speed in SVG units per second. */
  speed?: number;
  /** Pause between strokes, seconds. */
  gap?: number;
  /** Add at this timeline position (gsap position parameter). */
  at?: string | number;
  ease?: string;
  /** Hide the pencil for this run (e.g. hatching). */
  noPencil?: boolean;
};

/**
 * Director: sequences strokes into a GSAP timeline and drives the pencil cursor along them.
 * Each stroke animates stroke-dashoffset from its length to 0; the pencil follows the path tip.
 */
/** Global tempo: >1 is faster. */
export const TEMPO = 1.3;
/** Show the pencil cursor that follows the strokes. */
export const PENCIL = false;

export class Director {
  readonly tl: gsap.core.Timeline;
  private pencil: Pencil;
  private pt = { p: 0 };
  private last: { x: number; y: number } | null = null;

  constructor(pencil: Pencil, onComplete?: () => void) {
    this.pencil = pencil;
    this.tl = gsap.timeline({ paused: true, onComplete: () => { pencil.show(false); scratch.drawing(0); onComplete?.(); } });
  }

  /** Draw strokes one after another. */
  draw(strokes: Stroke[], o: DrawOpts = {}) {
    const speed = (o.speed ?? 900) * TEMPO, gap = (o.gap ?? 0.02) / TEMPO;
    if (!PENCIL) o = { ...o, noPencil: true };
    const sub = gsap.timeline();
    for (const s of strokes) {
      const start = s.el.getPointAtLength(0);
      if (s.el.dataset.word && o.noPencil) sub.to(this.pt, { p: 1, duration: 0.07 / TEMPO });
      // lift the pencil and carry it to the next stroke, like a hand moving across the page
      if (!o.noPencil) {
        const from = this.last;
        const dist = from ? Math.hypot(start.x - from.x, start.y - from.y) : 0;
        const travel = Math.min(0.22, Math.max(0.03, dist / 2600)) / TEMPO;
        const pos = { x: from?.x ?? start.x, y: from?.y ?? start.y };
        if (s.el.dataset.word) sub.to(this.pt, { p: 1, duration: 0.07 / TEMPO });
        sub.to(pos, {
          x: start.x, y: start.y, duration: travel, ease: "power2.inOut",
          onStart: () => { this.pencil.show(true); this.pencil.raise(); this.pencil.press(0); scratch.drawing(0); },
          onUpdate: () => this.pencil.moveTo(pos.x, pos.y),
        });
        const end = s.el.getPointAtLength(s.len);
        this.last = { x: end.x, y: end.y };
      }
      const dur = Math.max(0.03, s.len / speed);
      // short strokes (letters) accelerate and settle like a hand; long lines run evenly
      const ease = o.ease ?? (s.len < 140 ? "power1.inOut" : "none");
      const state = { off: s.len };
      sub.to(state, {
        off: 0, duration: dur, ease,
        onStart: () => { s.el.style.visibility = "visible"; if (!o.noPencil) this.pencil.press(1); scratch.drawing(1); s.el.style.strokeDashoffset = String(s.len); },
        onUpdate: () => {
          s.el.style.strokeDashoffset = String(state.off);
          if (!o.noPencil) { const pt = s.el.getPointAtLength(Math.max(0, s.len - state.off)); this.pencil.moveTo(pt.x, pt.y); }
        },
        onComplete: () => { s.el.style.strokeDashoffset = "0"; const dashed = s.el.dataset.dashed; if (dashed) s.el.style.strokeDasharray = dashed; },
      });
      if (gap > 0) sub.to(this.pt, { p: 1, duration: gap, onStart: () => { this.pencil.press(0); scratch.drawing(0); } });
    }
    this.tl.add(sub, o.at);
    return this;
  }

  /** Handwriting: same as draw, tuned for letters. */
  write(strokes: Stroke[], o: DrawOpts = {}) {
    return this.draw(strokes, { speed: 1000, gap: 0.006, ...o });
  }

  /** Erase strokes (they vanish from their start, as if rubbed out). */
  erase(strokes: Stroke[], o: DrawOpts = {}) {
    const sub = gsap.timeline();
    for (const s of strokes) {
      const state = { off: 0 };
      sub.to(state, { off: -s.len, duration: Math.max(0.05, s.len / (o.speed ?? 2400)), ease: "none", onUpdate: () => { s.el.style.strokeDasharray = `${s.len}`; s.el.style.strokeDashoffset = String(state.off); } }, "<0.01");
    }
    this.tl.add(sub, o.at);
    return this;
  }

  /** Reveal an image that was sketched: photo fades in, hatching lifts. */
  revealImage(r: { img: SVGImageElement; hatch: Stroke[] }, at?: string | number) {
    this.tl.to(r.img, { opacity: 1, duration: 0.8, ease: "power2.out" }, at);
    this.tl.to(r.hatch.map((h) => h.el), { opacity: 0, duration: 0.6 }, "<0.2");
    return this;
  }

  /** Reveal real HTML text with an ink wipe. */
  reveal(el: Element | Element[] | NodeListOf<Element>, at?: string | number, stagger = 0.08) {
    const els = el instanceof Element ? [el] : Array.from(el);
    this.tl.to(els, { "--wipe": "100%", opacity: 1, duration: 0.6, ease: "power2.out", stagger }, at);
    return this;
  }

  /** Wait. */
  pause(sec: number) { this.tl.to(this.pt, { p: 1, duration: sec }); return this; }
  label(name: string) { this.tl.addLabel(name); return this; }

  play() { this.tl.play(0); }
  finish(strokes: SVGPathElement[] = []) {
    this.tl.progress(1);
    for (const el of strokes) { el.style.visibility = "visible"; el.style.strokeDashoffset = "0"; if (el.dataset.dashed) el.style.strokeDasharray = el.dataset.dashed; el.style.opacity = el.getAttribute("opacity") || "1"; }
    this.pencil.show(false); scratch.drawing(0);
  }
  restart() { this.tl.restart(); }
}
