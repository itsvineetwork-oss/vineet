import * as THREE from "three";

const cache = new Map<string, THREE.CanvasTexture>();

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Renders a typographic "artwork" to a canvas texture. No image assets needed. */
export function artworkTexture(opts: { id: string; title: string; subtitle?: string; lines: string[]; accent: string; ratio: number; }) {
  const key = opts.id;
  const hit = cache.get(key);
  if (hit) return hit;

  const W = 1024;
  const H = Math.round(W / opts.ratio);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;

  // paper
  ctx.fillStyle = "#f3f1ec";
  ctx.fillRect(0, 0, W, H);
  // subtle grain
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 8;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const pad = 72;
  // accent rule
  ctx.fillStyle = opts.accent;
  ctx.fillRect(pad, pad, 56, 6);

  ctx.fillStyle = "#6f7378";
  ctx.font = "500 24px ui-monospace, Menlo, Consolas, monospace";
  ctx.textBaseline = "top";
  if (opts.subtitle) ctx.fillText(opts.subtitle.toUpperCase(), pad, pad + 28);

  ctx.fillStyle = "#16181a";
  let size = Math.min(104, Math.round(H * 0.16));
  ctx.font = `300 ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  let titleLines = wrap(ctx, opts.title, W - pad * 2);
  while (titleLines.length > 2 && size > 48) { size -= 8; ctx.font = `300 ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`; titleLines = wrap(ctx, opts.title, W - pad * 2); }
  let y = pad + (opts.subtitle ? 80 : 50);
  for (const l of titleLines) { ctx.fillText(l, pad - 4, y); y += size * 1.05; }

  y += 24;
  ctx.fillStyle = "#3a3d41";
  const body = Math.round(size * 0.36);
  ctx.font = `400 ${body}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  for (const line of opts.lines) {
    for (const l of wrap(ctx, line, W - pad * 2)) { if (y > H - pad - body) break; ctx.fillText(l, pad, y); y += body * 1.5; }
  }

  // small plaque mark bottom right
  ctx.fillStyle = "#9a9ca0";
  ctx.font = "500 20px ui-monospace, Menlo, Consolas, monospace";
  ctx.textAlign = "right";
  ctx.fillText("CLICK TO OPEN", W - pad, H - pad - 20);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}
