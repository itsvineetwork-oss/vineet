import rough from "roughjs";
import type { RoughSVG } from "roughjs/bin/svg";
import type { Options } from "roughjs/bin/core";
import { layoutText, measure, type FontName } from "./hershey";

const NS = "http://www.w3.org/2000/svg";

/** A faint displacement filter that gives every stroke a graphite edge. One per SVG. */
function ensureFilters(svg: SVGSVGElement) {
  if (svg.querySelector("#graphite")) return;
  const defs = document.createElementNS(NS, "defs");
  defs.innerHTML = `
    <filter id="graphite" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
  svg.insertBefore(defs, svg.firstChild);
}

export type Stroke = { el: SVGPathElement | SVGTextElement; len: number };

/** Scripts the Hershey fonts cannot write (Devanagari etc.) are set in a handwriting web font and wiped in. */
export const needsFont = (str: string) => /[^\u0000-\u024F\u2000-\u206F\u20B9]/.test(str);
export const HAND_FONT = '"Kalam", "Noto Sans Devanagari", "Architects Daughter", sans-serif';

let measurer: CanvasRenderingContext2D | null = null;
export function measureFont(str: string, px: number, weight = 400) {
  measurer ??= document.createElement("canvas").getContext("2d");
  if (!measurer) return str.length * px * 0.55;
  measurer.font = `${weight} ${px}px ${HAND_FONT}`;
  return measurer.measureText(str).width;
}

export type StrokeStyle = {
  color?: string;
  width?: number;
  opacity?: number;
  /** "pencil" adds a soft graphite look, "ink" is crisp. */
  tool?: "pencil" | "ink" | "marker";
  dashed?: boolean;
  className?: string;
};

export const INK = "var(--ink)";
export const GRAPHITE = "var(--graphite)";
export const RED = "var(--red)";
export const BLUE = "var(--blue)";
export const PENCIL = "var(--pencil)";
export const HIGHLIGHT = "var(--highlight)";

/**
 * Sketcher: turns shapes, text and images into SVG strokes that can be drawn progressively.
 * Everything is a <path> with stroke-dasharray so a Director can animate it.
 */
export class Sketcher {
  readonly svg: SVGSVGElement;
  readonly layer: SVGGElement;
  readonly rough: RoughSVG;
  private seed = 1;

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    this.layer = document.createElementNS(NS, "g");
    this.layer.setAttribute("class", "sk-layer");
    ensureFilters(svg);
    this.layer.setAttribute("filter", "url(#graphite)");
    svg.appendChild(this.layer);
    this.rough = rough.svg(svg);
  }

  /** Deterministic rough seeds so re-draws look identical. */
  private nextSeed() { return (this.seed = (this.seed * 9301 + 49297) % 233280); }

  private styleEl(el: SVGPathElement, st: StrokeStyle = {}) {
    const tool = st.tool ?? "pencil";
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", st.color ?? (tool === "pencil" ? GRAPHITE : INK));
    el.setAttribute("stroke-width", String(st.width ?? (tool === "marker" ? 4 : tool === "ink" ? 2 : 1.9)));
    el.setAttribute("stroke-linecap", "round");
    el.setAttribute("stroke-linejoin", "round");
    if (st.opacity !== undefined) el.setAttribute("opacity", String(st.opacity));
    if (st.dashed) el.setAttribute("data-dashed", "6 6");
    el.classList.add("sk", `sk-${tool}`);
    if (st.className) el.classList.add(st.className);
  }

  private toStroke(el: SVGPathElement): Stroke {
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.style.visibility = "hidden"; // round caps would otherwise show a dot before the stroke starts
    el.dataset.len = String(len);
    return { el, len };
  }

  /** Web-font text (for scripts Hershey cannot draw). One Stroke whose "length" is its width, revealed with a wipe. */
  fontText(str: string, x: number, y: number, size: number, st: StrokeStyle = {}, align: "left" | "center" | "right" = "left", weight = 400): Stroke {
    const el = document.createElementNS(NS, "text");
    const px = size * 1.25;
    el.textContent = str;
    el.setAttribute("x", String(x)); el.setAttribute("y", String(y));
    el.setAttribute("font-family", HAND_FONT);
    el.setAttribute("font-size", String(px));
    el.setAttribute("font-weight", String(weight));
    el.setAttribute("fill", st.color ?? INK);
    el.setAttribute("text-anchor", align === "center" ? "middle" : align === "right" ? "end" : "start");
    if (st.opacity !== undefined) el.setAttribute("opacity", String(st.opacity));
    el.classList.add("sk", "sk-font");
    const w = measureFont(str, px, weight);
    const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
    // wipe from left to right: clip rect grows with the stroke's progress
    const clipId = `clip-${Math.random().toString(36).slice(2, 9)}`;
    const clip = document.createElementNS(NS, "clipPath"); clip.setAttribute("id", clipId);
    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", String(x0 - 4)); rect.setAttribute("y", String(y - px * 1.1)); rect.setAttribute("width", "0"); rect.setAttribute("height", String(px * 1.6));
    clip.appendChild(rect); this.layer.appendChild(clip);
    el.setAttribute("clip-path", `url(#${clipId})`);
    el.dataset.clip = clipId; el.dataset.w = String(w + 8);
    el.style.visibility = "hidden";
    this.layer.appendChild(el);
    return { el, len: w };
  }

  /** A raw path. */
  path(d: string, st: StrokeStyle = {}, parent: SVGElement = this.layer): Stroke {
    const el = document.createElementNS(NS, "path");
    el.setAttribute("d", d);
    this.styleEl(el, st);
    parent.appendChild(el);
    return this.toStroke(el);
  }

  /** Adopt every <path> from a rough.js <g> into the layer. Rough emits the hachure fill path first, then the outline. */
  private adopt(g: SVGGElement, st: StrokeStyle, parent: SVGElement = this.layer, hasFill = false): Stroke[] {
    const out: Stroke[] = [];
    const paths = Array.from(g.querySelectorAll("path"));
    paths.forEach((p, i) => {
      const el = document.createElementNS(NS, "path");
      el.setAttribute("d", p.getAttribute("d") || "");
      const isFill = hasFill && i === 0 && paths.length > 1;
      this.styleEl(el, isFill ? { ...st, width: (st.width ?? 1.4) * 0.7, opacity: 0.55 } : st);
      parent.appendChild(el);
      out.push(this.toStroke(el));
    });
    return out;
  }

  private ropts(st: StrokeStyle, extra: Options = {}): Options {
    void st;
    return { roughness: 1.1, bowing: 0.8, stroke: "#000", seed: this.nextSeed(), strokeWidth: 1, ...extra, ...(extra.fill ? { fillStyle: extra.fillStyle ?? "hachure", hachureGap: extra.hachureGap ?? 7, hachureAngle: extra.hachureAngle ?? -41, fillWeight: 0.8 } : {}) };
  }

  line(x1: number, y1: number, x2: number, y2: number, st: StrokeStyle = {}, o: Options = {}) {
    return this.adopt(this.rough.line(x1, y1, x2, y2, this.ropts(st, o)), st);
  }
  rect(x: number, y: number, w: number, h: number, st: StrokeStyle = {}, o: Options = {}) {
    return this.adopt(this.rough.rectangle(x, y, w, h, this.ropts(st, o)), st, this.layer, !!o.fill);
  }
  ellipse(cx: number, cy: number, w: number, h: number, st: StrokeStyle = {}, o: Options = {}) {
    return this.adopt(this.rough.ellipse(cx, cy, w, h, this.ropts(st, o)), st, this.layer, !!o.fill);
  }
  circle(cx: number, cy: number, d: number, st: StrokeStyle = {}, o: Options = {}) {
    return this.adopt(this.rough.circle(cx, cy, d, this.ropts(st, o)), st, this.layer, !!o.fill);
  }
  polygon(pts: [number, number][], st: StrokeStyle = {}, o: Options = {}) {
    return this.adopt(this.rough.polygon(pts, this.ropts(st, o)), st, this.layer, !!o.fill);
  }
  curve(pts: [number, number][], st: StrokeStyle = {}, o: Options = {}) {
    return this.adopt(this.rough.curve(pts, this.ropts(st, o)), st);
  }
  /** Sketchy path (rough re-draws an SVG path). */
  sketchPath(d: string, st: StrokeStyle = {}, o: Options = {}) {
    return this.adopt(this.rough.path(d, this.ropts(st, { roughness: 0.8, ...o })), st, this.layer, !!o.fill);
  }

  /** Arrow from (x1,y1) to (x2,y2) with an open head. */
  arrow(x1: number, y1: number, x2: number, y2: number, st: StrokeStyle = {}, head = 10) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const strokes = this.line(x1, y1, x2, y2, st);
    const hx = (t: number) => x2 - head * Math.cos(a + t), hy = (t: number) => y2 - head * Math.sin(a + t);
    strokes.push(this.path(`M${hx(0.5)},${hy(0.5)} L${x2},${y2} L${hx(-0.5)},${hy(-0.5)}`, st));
    return strokes;
  }

  /** Handwritten text, one stroke group per character. */
  text(str: string, x: number, y: number, size: number, st: StrokeStyle = {}, font: FontName = "scriptc", tracking = 0, align: "left" | "center" | "right" = "left") {
    if (needsFont(str)) {
      const stroke = this.fontText(str, x, y, size, st, align, font === "scriptc" ? 700 : 400);
      return { strokes: [stroke], width: stroke.len };
    }
    const w = layoutText(str, 0, 0, size, font, tracking).width;
    const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
    const { paths } = layoutText(str, x0, y, size, font, tracking);
    const strokes: Stroke[] = [];
    for (const p of paths) {
      const st2 = this.path(p.d, { tool: "ink", width: Math.max(1.5, size / 15), ...st });
      if (p.word) st2.el.dataset.word = "1"; // first letter of a word: the Director pauses there
      strokes.push(st2);
    }
    return { strokes, width: w };
  }

  /** Technical lettering (simplex sans), for labels and annotations. */
  label(str: string, x: number, y: number, size = 14, st: StrokeStyle = {}, align: "left" | "center" | "right" = "left") {
    return this.text(str, x, y, size, { tool: "pencil", width: Math.max(1.3, size / 12), ...st }, "futural", 1, align);
  }

  /** Body text in technical lettering, wrapped to `maxWidth`. Returns strokes line by line and the height used. */
  paragraph(str: string, x: number, y: number, size: number, maxWidth: number, st: StrokeStyle = {}, font: FontName = "futural", lineHeight = 1.55) {
    const words = str.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    const wide = needsFont(str);
    const width = (t: string) => (wide ? measureFont(t, size * 1.25) : measure(t, size, font, 1));
    if (wide) lineHeight = Math.max(lineHeight, 1.7);
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (width(test) > maxWidth && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    const strokes: Stroke[] = [];
    lines.forEach((l, i) => strokes.push(...this.text(l, x, y + i * size * lineHeight, size, { tool: "pencil", width: Math.max(1.3, size / 12), ...st }, font, 1).strokes));
    return { strokes, lines: lines.length, height: lines.length * size * lineHeight };
  }

  /** Bulleted lines: a short red dash, then wrapped text. */
  bullets(items: string[], x: number, y: number, size: number, maxWidth: number, st: StrokeStyle = {}) {
    const strokes: Stroke[] = [];
    let cy = y;
    for (const it of items) {
      // a small hand-drawn tick instead of a dash
      strokes.push(...this.sketchPath(`M${x},${cy - size * 0.35} L${x + size * 0.3},${cy - size * 0.05} L${x + size * 0.85},${cy - size * 0.75}`, { color: RED, width: 1.5, tool: "ink" }, { roughness: 0.5 }));
      const p = this.paragraph(it, x + size * 1.4, cy, size, maxWidth - size * 1.4, st);
      strokes.push(...p.strokes);
      cy += p.height + size * 0.3;
    }
    return { strokes, height: cy - y };
  }

  /** Small boxed tag, like a stamp on a drawing. */
  tag(str: string, x: number, y: number, size = 12, st: StrokeStyle = { color: GRAPHITE }) {
    const w = (needsFont(str) ? measureFont(str, size * 1.25) : measure(str, size, "futural", 1)) + size * 1.2;
    const strokes = [...this.rect(x, y - size * 1.3, w, size * 1.9, st, { roughness: 0.8 }), ...this.label(str, x + size * 0.6, y, size, st).strokes];
    return { strokes, width: w };
  }

  /** Dimension line with ticks, like an architectural drawing. */
  dimension(x1: number, y: number, x2: number, text: string, st: StrokeStyle = { color: GRAPHITE, width: 1 }) {
    const s = [...this.line(x1, y, x2, y, st), ...this.line(x1, y - 6, x1, y + 6, st), ...this.line(x2, y - 6, x2, y + 6, st)];
    s.push(...this.label(text, (x1 + x2) / 2, y - 8, 11, st, "center").strokes);
    return s;
  }

  /** Image that is "sketched" first: hatching strokes draw over the frame, then the photo fades in and the hatching lifts. */
  image(href: string, x: number, y: number, w: number, h: number, st: StrokeStyle = {}) {
    const g = document.createElementNS(NS, "g");
    this.layer.appendChild(g);
    const img = document.createElementNS(NS, "image");
    img.setAttribute("href", href);
    img.setAttribute("x", String(x)); img.setAttribute("y", String(y));
    img.setAttribute("width", String(w)); img.setAttribute("height", String(h));
    img.setAttribute("preserveAspectRatio", "xMidYMid slice");
    img.style.opacity = "0";
    g.appendChild(img);
    const hatch = this.adopt(this.rough.rectangle(x, y, w, h, this.ropts(st, { fill: "#000", hachureGap: 9, roughness: 0.6, stroke: "none" })), { ...st, opacity: 0.35 }, g);
    hatch.forEach((h) => (h.el.dataset.hatch = "1"));
    const frame = this.adopt(this.rough.rectangle(x - 4, y - 4, w + 8, h + 8, this.ropts(st, { roughness: 1.4 })), { tool: "ink", ...st }, g);
    return { img, hatch, frame };
  }

  /** Every stroke currently on the page. */
  strokes(): (SVGPathElement | SVGTextElement)[] { return Array.from(this.layer.querySelectorAll<SVGPathElement | SVGTextElement>("path.sk, text.sk")); }

  /** Faint graphite construction lines: the guide the artist drew before inking. Drawn fast, no pencil. */
  construction(x: number, y: number, w: number, h: number) {
    const st = { color: PENCIL, width: 0.8, opacity: 0.55, className: "sk-construction" };
    return [
      ...this.line(x - 14, y, x + w + 14, y, st, { roughness: 0.2 }),
      ...this.line(x - 14, y + h, x + w + 14, y + h, st, { roughness: 0.2 }),
      ...this.line(x, y - 14, x, y + h + 14, st, { roughness: 0.2 }),
      ...this.line(x + w, y - 14, x + w, y + h + 14, st, { roughness: 0.2 }),
    ];
  }

  /** CAD registration marks (+) at the four corners of a card. */
  registration(x: number, y: number, w: number, h: number, size = 6) {
    const st = { color: GRAPHITE, width: 0.9 };
    const marks: Stroke[] = [];
    for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]] as [number, number][]) {
      marks.push(...this.line(cx - size, cy, cx + size, cy, st, { roughness: 0.15 }), ...this.line(cx, cy - size, cx, cy + size, st, { roughness: 0.15 }));
    }
    return marks;
  }

  /** A highlighter swipe behind text: one wide translucent marker stroke, slightly wobbly. */
  highlight(x: number, y: number, w: number, size: number, color = HIGHLIGHT) {
    const h = size * 1.15;
    const d = `M${x - 4},${y - h * 0.45} C${x + w * 0.3},${y - h * 0.55} ${x + w * 0.7},${y - h * 0.3} ${x + w + 6},${y - h * 0.42}`;
    const el = this.path(d, { color, width: h, opacity: 0.55, tool: "marker", className: "sk-highlight" });
    el.el.setAttribute("stroke-linecap", "butt");
    return el;
  }

  /** Marker scribble that colours the inside of a box, clipped to it: zig-zag strokes like a colour pencil. */
  scribble(x: number, y: number, w: number, h: number, color: string, pitch = 9) {
    const id = `scrib-${Math.random().toString(36).slice(2, 9)}`;
    const clip = document.createElementNS(NS, "clipPath"); clip.setAttribute("id", id);
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("x", String(x + 2)); r.setAttribute("y", String(y + 2)); r.setAttribute("width", String(w - 4)); r.setAttribute("height", String(h - 4));
    clip.appendChild(r); this.layer.appendChild(clip);
    const g = document.createElementNS(NS, "g"); g.setAttribute("clip-path", `url(#${id})`); this.layer.appendChild(g);
    // one continuous zig-zag across the box
    let d = `M${x - 6},${y + 4}`;
    let up = false;
    for (let px = x - 6; px <= x + w + 6; px += pitch) { up = !up; d += ` L${px + pitch / 2},${up ? y + h + 6 : y - 6}`; }
    const el = this.path(d, { color, width: pitch * 1.7, opacity: 0.3, tool: "marker", className: "sk-scribble" }, g);
    return el;
  }

  /** An invisible hit area over a diagram node, carrying a note for the hover spec card. */
  hotspot(x: number, y: number, w: number, h: number, title: string, note: string) {
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("x", String(x)); r.setAttribute("y", String(y)); r.setAttribute("width", String(w)); r.setAttribute("height", String(h));
    r.setAttribute("fill", "transparent"); r.setAttribute("class", "hotspot");
    r.dataset.title = title; r.dataset.note = note;
    this.svg.appendChild(r);
    return r;
  }

  /** Drop everything drawn so far. */
  clear() { this.layer.innerHTML = ""; this.seed = 1; this.svg.querySelectorAll(".hotspot").forEach((h) => h.remove()); }
}
