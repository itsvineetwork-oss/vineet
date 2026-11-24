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
  const out: { d: string; x: number; char: string }[] = [];
  let cx = x;
  const expanded = Array.from(text).map((c) => SUBS[c] ?? c).join("");
  for (const ch of expanded) {
    const g = glyph(font, ch);
    // Hershey glyphs are centred on their origin; shift so the glyph's left edge starts at the pen.
    const w = (g.o ?? 8) * 2;
    if (!g.d) { cx += w * s * 0.6 + tracking; continue; }
    out.push({ d: scalePath(g.d, s, cx, y - BASE * s), x: cx, char: ch });
    cx += w * s + tracking;
  }
  return { paths: out, width: cx - x };
}

export function measure(text: string, size: number, font: FontName = "scriptc", tracking = 0) {
  return layoutText(text, 0, 0, size, font, tracking).width;
}

/** Scale/translate an absolute-coordinate Hershey path ("M x,y L x,y x,y ..."). */
function scalePath(d: string, s: number, dx: number, dy: number) {
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_m, a, b) => `${(+a * s + dx).toFixed(2)},${(+b * s + dy).toFixed(2)}`);
}
