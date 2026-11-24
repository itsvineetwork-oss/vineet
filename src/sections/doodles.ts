import { Sketcher, INK, GRAPHITE, RED, BLUE, type Stroke } from "../engine/sketch";

/** Small hand-drawn illustrations used to fill the margins of the sheets. Every one returns strokes to draw. */

export function gear(sk: Sketcher, cx: number, cy: number, r: number, teeth = 8, color = INK): Stroke[] {
  const out: Stroke[] = [...sk.circle(cx, cy, r * 2, { color, tool: "ink", width: 1.4 }, { roughness: 1 }), ...sk.circle(cx, cy, r * 0.7, { color, tool: "ink", width: 1.2 })];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2, a2 = a + Math.PI / teeth * 0.9;
    const p = (ang: number, rr: number): [number, number] => [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr];
    out.push(...sk.sketchPath(`M${p(a, r).join(",")} L${p(a, r * 1.3).join(",")} L${p(a2, r * 1.3).join(",")} L${p(a2, r).join(",")}`, { color, tool: "ink", width: 1.3 }, { roughness: 0.5 }));
  }
  return out;
}

export function coffee(sk: Sketcher, x: number, y: number, s = 1): Stroke[] {
  return [
    ...sk.sketchPath(`M${x},${y} L${x + 4 * s},${y + 34 * s} Q${x + 20 * s},${y + 40 * s} ${x + 36 * s},${y + 34 * s} L${x + 40 * s},${y}`, { color: INK, tool: "ink", width: 1.4 }, { roughness: 0.7 }),
    ...sk.ellipse(x + 20 * s, y, 42 * s, 10 * s, { color: INK, tool: "ink", width: 1.3 }),
    ...sk.sketchPath(`M${x + 40 * s},${y + 8 * s} C${x + 58 * s},${y + 6 * s} ${x + 58 * s},${y + 26 * s} ${x + 38 * s},${y + 26 * s}`, { color: INK, tool: "ink", width: 1.3 }),
    ...sk.sketchPath(`M${x + 12 * s},${y - 8 * s} C${x + 8 * s},${y - 16 * s} ${x + 16 * s},${y - 20 * s} ${x + 12 * s},${y - 28 * s} M${x + 24 * s},${y - 8 * s} C${x + 20 * s},${y - 16 * s} ${x + 28 * s},${y - 20 * s} ${x + 24 * s},${y - 28 * s}`, { color: GRAPHITE, width: 1 }, { roughness: 0.6 }),
  ];
}

export function lightbulb(sk: Sketcher, cx: number, cy: number, r = 22): Stroke[] {
  return [
    ...sk.sketchPath(`M${cx - r * 0.55},${cy + r * 0.9} C${cx - r * 1.3},${cy + r * 0.2} ${cx - r * 1.1},${cy - r * 1.1} ${cx},${cy - r * 1.1} C${cx + r * 1.1},${cy - r * 1.1} ${cx + r * 1.3},${cy + r * 0.2} ${cx + r * 0.55},${cy + r * 0.9} Z`, { color: INK, tool: "ink", width: 1.5 }, { roughness: 0.8 }),
    ...sk.rect(cx - r * 0.5, cy + r * 0.95, r, r * 0.5, { color: INK, tool: "ink", width: 1.3 }),
    ...sk.line(cx - r * 0.3, cy + r * 1.6, cx + r * 0.3, cy + r * 1.6, { color: INK, tool: "ink", width: 1.3 }),
    ...sk.sketchPath(`M${cx - r * 0.25},${cy + r * 0.9} L${cx - r * 0.1},${cy + r * 0.2} L${cx + r * 0.1},${cy + r * 0.5} L${cx + r * 0.25},${cy + r * 0.9}`, { color: RED, width: 1.2 }),
    ...sk.line(cx - r * 1.7, cy - r * 0.6, cx - r * 1.4, cy - r * 0.45, { color: GRAPHITE, width: 1 }),
    ...sk.line(cx + r * 1.7, cy - r * 0.6, cx + r * 1.4, cy - r * 0.45, { color: GRAPHITE, width: 1 }),
    ...sk.line(cx, cy - r * 1.6, cx, cy - r * 1.3, { color: GRAPHITE, width: 1 }),
  ];
}

export function books(sk: Sketcher, x: number, y: number, w = 90): Stroke[] {
  const out: Stroke[] = [];
  const hs = [18, 14, 20];
  let cy = y;
  hs.forEach((h, i) => {
    cy -= h;
    const dx = i * 6 - 6;
    out.push(...sk.rect(x + dx, cy, w - Math.abs(dx), h, { color: INK, tool: "ink", width: 1.3 }, { roughness: 0.9 }));
    out.push(...sk.line(x + dx + 10, cy + h / 2, x + dx + w - Math.abs(dx) - 10, cy + h / 2, { color: GRAPHITE, width: 0.9 }));
  });
  return out;
}

export function paperPlane(sk: Sketcher, x: number, y: number, s = 1, color = INK): Stroke[] {
  return [
    ...sk.sketchPath(`M${x},${y} L${x + 60 * s},${y - 22 * s} L${x + 22 * s},${y + 22 * s} L${x + 18 * s},${y + 6 * s} Z`, { color, tool: "ink", width: 1.4 }, { roughness: 0.6 }),
    ...sk.line(x, y, x + 18 * s, y + 6 * s, { color, tool: "ink", width: 1.2 }),
    ...sk.line(x + 18 * s, y + 6 * s, x + 60 * s, y - 22 * s, { color, tool: "ink", width: 1.2 }),
  ];
}

/** Dashed flight path for the plane. */
export function flightPath(sk: Sketcher, d: string): Stroke[] {
  return sk.sketchPath(d, { color: GRAPHITE, width: 1, dashed: true }, { roughness: 0.4 });
}

/** A rail track: two rails with sleepers. Drawn fast, like a construction detail. */
export function railTrack(sk: Sketcher, x1: number, x2: number, y: number, gauge = 10): Stroke[] {
  const out: Stroke[] = [...sk.line(x1, y + gauge, x2, y + gauge, { color: GRAPHITE, width: 1.2 }, { roughness: 0.4 })];
  for (let x = x1 + 10; x < x2; x += 26) out.push(...sk.line(x, y - 4, x, y + gauge + 4, { color: GRAPHITE, width: 1.4 }, { roughness: 0.3 }));
  return out;
}

export function ruler(sk: Sketcher, x: number, y: number, w: number): Stroke[] {
  const out: Stroke[] = [...sk.rect(x, y, w, 22, { color: INK, tool: "ink", width: 1.3 }, { roughness: 0.7 })];
  for (let i = 0; i <= w; i += 10) out.push(...sk.line(x + i, y, x + i, y + (i % 50 === 0 ? 12 : i % 20 === 0 ? 8 : 5), { color: GRAPHITE, width: 0.9 }, { roughness: 0.2 }));
  return out;
}

export function keypad(sk: Sketcher, x: number, y: number): Stroke[] {
  const out: Stroke[] = [...sk.rect(x, y, 96, 120, { color: INK, tool: "ink", width: 1.4 }, { roughness: 0.9 }), ...sk.rect(x + 10, y + 10, 76, 24, { color: GRAPHITE, width: 1 })];
  out.push(...sk.label("1 452.8", x + 82, y + 27, 10, { color: INK }, "right").strokes);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out.push(...sk.rect(x + 12 + c * 26, y + 44 + r * 24, 18, 16, { color: GRAPHITE, width: 0.9 }, { roughness: 0.6 }));
  return out;
}

export function calendar(sk: Sketcher, x: number, y: number): Stroke[] {
  const out: Stroke[] = [...sk.rect(x, y, 90, 80, { color: INK, tool: "ink", width: 1.4 }, { roughness: 0.9 }), ...sk.line(x, y + 20, x + 90, y + 20, { color: INK, tool: "ink", width: 1.2 }), ...sk.line(x + 20, y - 8, x + 20, y + 6, { color: INK, tool: "ink", width: 1.6 }), ...sk.line(x + 70, y - 8, x + 70, y + 6, { color: INK, tool: "ink", width: 1.6 })];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) out.push(...sk.line(x + 10 + c * 16, y + 34 + r * 16, x + 18 + c * 16, y + 34 + r * 16, { color: GRAPHITE, width: 1 }));
  out.push(...sk.circle(x + 46, y + 50, 14, { color: RED, width: 1.3 }));
  return out;
}

export function compassRose(sk: Sketcher, cx: number, cy: number, r = 26): Stroke[] {
  return [
    ...sk.circle(cx, cy, r * 2, { color: GRAPHITE, width: 1 }, { roughness: 0.8 }),
    ...sk.sketchPath(`M${cx},${cy - r} L${cx + r * 0.25},${cy} L${cx},${cy + r} L${cx - r * 0.25},${cy} Z`, { color: INK, tool: "ink", width: 1.2 }, { roughness: 0.4 }),
    ...sk.sketchPath(`M${cx - r},${cy} L${cx},${cy - r * 0.25} L${cx + r},${cy} L${cx},${cy + r * 0.25} Z`, { color: GRAPHITE, width: 1 }, { roughness: 0.4 }),
    ...sk.label("N", cx, cy - r - 6, 10, { color: RED }, "center").strokes,
  ];
}

export function documentStack(sk: Sketcher, x: number, y: number): Stroke[] {
  const out: Stroke[] = [];
  for (let i = 2; i >= 0; i--) {
    const dx = i * 6, dy = -i * 6;
    out.push(...sk.sketchPath(`M${x + dx},${y + dy} L${x + dx + 44},${y + dy} L${x + dx + 58},${y + dy + 14} L${x + dx + 58},${y + dy + 70} L${x + dx},${y + dy + 70} Z`, { color: INK, tool: "ink", width: 1.3 }, { roughness: 0.7 }));
  }
  out.push(...sk.line(x + 10, y + 30, x + 46, y + 30, { color: GRAPHITE, width: 1 }), ...sk.line(x + 10, y + 44, x + 46, y + 44, { color: GRAPHITE, width: 1 }), ...sk.line(x + 10, y + 58, x + 34, y + 58, { color: GRAPHITE, width: 1 }));
  return out;
}

export function monitor(sk: Sketcher, x: number, y: number, w = 120, h = 80): Stroke[] {
  return [
    ...sk.rect(x, y, w, h, { color: INK, tool: "ink", width: 1.4 }, { roughness: 0.8 }),
    ...sk.rect(x + 6, y + 6, w - 12, h - 12, { color: GRAPHITE, width: 0.9 }),
    ...sk.line(x + w / 2 - 14, y + h + 12, x + w / 2 + 14, y + h + 12, { color: INK, tool: "ink", width: 1.3 }),
    ...sk.line(x + w / 2, y + h, x + w / 2, y + h + 12, { color: INK, tool: "ink", width: 1.3 }),
    ...sk.line(x + 16, y + 24, x + 50, y + 24, { color: GRAPHITE, width: 1 }), ...sk.line(x + 22, y + 36, x + 70, y + 36, { color: GRAPHITE, width: 1 }), ...sk.line(x + 22, y + 48, x + 56, y + 48, { color: BLUE, width: 1 }), ...sk.line(x + 16, y + 60, x + 40, y + 60, { color: GRAPHITE, width: 1 }),
  ];
}
