import { Sketcher } from "../engine/sketch";
import { Pencil } from "../engine/pencil";
import { Director } from "../engine/director";
import gsap from "gsap";

export type Scene = {
  id: string;
  section: HTMLElement;
  director: Director;
  rebuild: () => void;
  /** Rub everything out quickly (used before leaving a section). Returns the duration in seconds. */
  erase: () => number;
  /** Jump to the fully drawn state. */
  finish: () => void;
  erased: boolean;
  /** True once the drawing has completed (or was finished / skipped). */
  done: boolean;
  /** Called whenever the drawing completes. */
  onDone?: () => void;
};

export type Builder = (sk: Sketcher, d: Director, section: HTMLElement) => void;

/**
 * Creates the SVG stage for a section and wires a builder that lays out strokes and the timeline.
 * `rebuild` clears and re-runs the builder, used when a nav click restarts the drawing.
 */
export function makeScene(id: string, viewBox: [number, number], build: Builder, root?: HTMLElement): Scene {
  const section = root ?? (document.getElementById(id) as HTMLElement);
  const svg = section.querySelector("svg.stage") as SVGSVGElement;
  svg.setAttribute("viewBox", `0 0 ${viewBox[0]} ${viewBox[1]}`);
  const sk = new Sketcher(svg);
  const pencil = new Pencil(svg);
  const complete = () => { section.classList.add("is-drawn"); scene.done = true; scene.onDone?.(); };
  let director = new Director(pencil, complete);

  const run = () => {
    scene.erased = false;
    scene.done = false;
    section.classList.remove("is-drawn");
    sk.clear();
    director.tl.kill();
    director = new Director(pencil, complete);
    section.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => { el.style.setProperty("--wipe", "0%"); el.style.opacity = "0"; });
    build(sk, director, section);
    scene.director = director;
  };
  const erase = () => {
    const paths = sk.strokes();
    if (!paths.length) return 0;
    director.tl.pause();
    scene.erased = true;
    gsap.to(paths, { strokeDashoffset: (_i: number, el: SVGPathElement) => -Number(el.dataset.len || 0), duration: 0.45, ease: "power1.in", stagger: { each: 0.004, from: "end" }, onComplete: () => paths.forEach((el) => (el.style.visibility = "hidden")) });
    gsap.to(section.querySelectorAll("[data-reveal]"), { opacity: 0, duration: 0.3 });
    return 0.5;
  };
  const finish = () => { scene.director.finish(sk.strokes()); section.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => { el.style.opacity = "1"; }); if (!scene.done) complete(); };
  const scene: Scene = { id, section, director, rebuild: run, erase, finish, erased: false, done: false };
  run();
  return scene;
}

/** Shorthand for the HTML text blocks a scene reveals after drawing. */
export const revealables = (section: HTMLElement) => section.querySelectorAll("[data-reveal]");
