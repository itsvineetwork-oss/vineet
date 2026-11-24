import fonts from "./fonts.json";

export type FontName = keyof typeof fonts;

/** Hershey glyphs: baseline at y=22, cap height ~21 units; chars start at '!' (33). */
const BASE = 22;
const UNITS = 21;

/** Characters the Hershey fonts lack, mapped to close equivalents. */
const SUBS: Record<string, string> = { "·": "-", "•": "-", "—": "-", "–": "-", "→": "->", "σ": "s", "’": "'", "‘": "'", "“": '"', "”": '"' };

function glyph(font: FontName, ch: string) {
  const f = fonts[font];
  const code = ch.charCodeAt(0);
  if (ch === " ") return { d: "", o: 8 };
  const g = f.chars[code - 33];
  if (g) return g;
  const q = f.chars["?".charCodeAt(0) - 33];
  return q ?? { d: "", o: 8 };
}

/** Returns per-character path data for a string, scaled to `size` px cap height, starting at (x, y=baseline). */
export function layoutText(text: string, x: number, y: number, size: number, font: FontName = "scriptc", tracking = 0) {
  const s = size / UNITS;
  const out: { d: string; x: number; char: string; word: boolean }[] = [];
  let cx = x;
  let afterSpace = false;
  const expanded = Array.from(text).map((c) => SUBS[c] ?? c).join("");
  for (const ch of expanded) {
    const g = glyph(font, ch);
    const w = (g.o ?? 8) * 2;
    if (!g.d) { cx += w * s * 0.6 + tracking; afterSpace = out.length > 0; continue; }
    out.push({ d: scalePath(g.d, s, cx, y - BASE * s), x: cx, char: ch, word: afterSpace });
    afterSpace = false;
    cx += w * s + tracking;
  }
  return { paths: out, width: cx - x };
}

export function measure(text: string, size: number, font: FontName = "scriptc", tracking = 0) {
  return layoutText(text, 0, 0, size, font, tracking).width;
}

type Pt = [number, number];

/** Scale/translate an absolute-coordinate Hershey path and turn its polylines into smooth curves. */
function scalePath(d: string, s: number, dx: number, dy: number) {
  const subpaths: Pt[][] = [];
  for (const chunk of d.split("M").map((c) => c.trim()).filter(Boolean)) {
    const nums = chunk.replace(/L/g, " ").match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    const pts: Pt[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i] * s + dx, nums[i + 1] * s + dy]);
    if (pts.length) subpaths.push(pts);
  }
  return subpaths.map(smoothPolyline).join(" ");
}

/** Catmull-Rom through the points, split at sharp corners so letters like E, L and N keep their angles. */
function smoothPolyline(pts: Pt[]): string {
  const f = (n: number) => n.toFixed(2);
  if (pts.length < 3) return `M${f(pts[0][0])},${f(pts[0][1])}` + pts.slice(1).map((p) => ` L${f(p[0])},${f(p[1])}`).join("");
  // split into runs at corners sharper than ~65 degrees
  const runs: Pt[][] = [];
  let run: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
    const v1x = bx - ax, v1y = by - ay, v2x = cx - bx, v2y = cy - by;
    const l1 = Math.hypot(v1x, v1y) || 1, l2 = Math.hypot(v2x, v2y) || 1;
    const cos = (v1x * v2x + v1y * v2y) / (l1 * l2);
    run.push(pts[i]);
    if (cos < 0.42) { runs.push(run); run = [pts[i]]; }
  }
  run.push(pts[pts.length - 1]);
  runs.push(run);
  let out = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (const r of runs) {
    if (r.length < 3) { for (let i = 1; i < r.length; i++) out += ` L${f(r[i][0])},${f(r[i][1])}`; continue; }
    for (let i = 0; i < r.length - 1; i++) {
      const p0 = r[Math.max(0, i - 1)], p1 = r[i], p2 = r[i + 1], p3 = r[Math.min(r.length - 1, i + 2)];
      const k = 1 / 6;
      const c1x = p1[0] + (p2[0] - p0[0]) * k, c1y = p1[1] + (p2[1] - p0[1]) * k;
      const c2x = p2[0] - (p3[0] - p1[0]) * k, c2y = p2[1] - (p3[1] - p1[1]) * k;
      out += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
    }
  }
  return out;
}
