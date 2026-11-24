import { makeScene, revealables } from "./scene";
import { Sketcher, INK, GRAPHITE, RED, BLUE, type Stroke } from "../engine/sketch";
import { skills } from "../content";

const icons: Record<string, (sk: Sketcher, x: number, y: number) => Stroke[]> = {
  code: (sk, x, y) => sk.sketchPath(`M ${x - 22} ${y - 18} L ${x - 40} ${y} L ${x - 22} ${y + 18} M ${x + 22} ${y - 18} L ${x + 40} ${y} L ${x + 22} ${y + 18} M ${x + 8} ${y - 24} L ${x - 8} ${y + 24}`, { color: INK, tool: "ink", width: 1.6 }),
  server: (sk, x, y) => [...sk.rect(x - 40, y - 26, 80, 20, { color: INK, tool: "ink" }), ...sk.rect(x - 40, y + 2, 80, 20, { color: INK, tool: "ink" }), ...sk.circle(x + 28, y - 16, 5, { color: RED, width: 1.4 }), ...sk.circle(x + 28, y + 12, 5, { color: RED, width: 1.4 })],
  browser: (sk, x, y) => [...sk.rect(x - 44, y - 28, 88, 56, { color: INK, tool: "ink" }), ...sk.line(x - 44, y - 14, x + 44, y - 14, { color: INK, tool: "ink" }), ...sk.circle(x - 34, y - 21, 4, { color: GRAPHITE }), ...sk.circle(x - 24, y - 21, 4, { color: GRAPHITE }), ...sk.line(x - 30, y, x + 20, y, { color: GRAPHITE }), ...sk.line(x - 30, y + 12, x + 32, y + 12, { color: GRAPHITE })],
  database: (sk, x, y) => [...sk.ellipse(x, y - 22, 70, 24, { color: INK, tool: "ink" }), ...sk.line(x - 35, y - 22, x - 35, y + 22, { color: INK, tool: "ink" }), ...sk.line(x + 35, y - 22, x + 35, y + 22, { color: INK, tool: "ink" }), ...sk.sketchPath(`M ${x - 35} ${y + 22} A 35 12 0 0 0 ${x + 35} ${y + 22}`, { color: INK, tool: "ink" }), ...sk.sketchPath(`M ${x - 35} ${y} A 35 12 0 0 0 ${x + 35} ${y}`, { color: GRAPHITE })],
  cloud: (sk, x, y) => [...sk.sketchPath(`M ${x - 30} ${y + 14} C ${x - 52} ${y + 14} ${x - 52} ${y - 16} ${x - 28} ${y - 14} C ${x - 24} ${y - 36} ${x + 10} ${y - 36} ${x + 14} ${y - 18} C ${x + 44} ${y - 22} ${x + 50} ${y + 14} ${x + 26} ${y + 14} Z`, { color: INK, tool: "ink" }, { roughness: 0.8 }), ...sk.rect(x - 14, y + 20, 10, 8, { color: BLUE }), ...sk.rect(x - 2, y + 20, 10, 8, { color: BLUE }), ...sk.rect(x + 10, y + 20, 10, 8, { color: BLUE })],
  link: (sk, x, y) => [...sk.sketchPath(`M ${x - 10} ${y + 8} L ${x - 24} ${y + 22} A 12 12 0 0 1 ${x - 40} ${y + 6} L ${x - 26} ${y - 8}`, { color: INK, tool: "ink", width: 1.6 }), ...sk.sketchPath(`M ${x + 10} ${y - 8} L ${x + 24} ${y - 22} A 12 12 0 0 1 ${x + 40} ${y - 6} L ${x + 26} ${y + 8}`, { color: INK, tool: "ink", width: 1.6 }), ...sk.line(x - 12, y + 6, x + 12, y - 6, { color: INK, tool: "ink", width: 1.6 })],
};

export const skillsScene = () =>
  makeScene("skills", [1200, 860], (sk, d, section) => {
    const h = sk.text("Skills", 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });
    d.write(sk.label("TECHNICAL BLUEPRINT  ·  SCALE 1:1", 72, 160, 11, { color: GRAPHITE }).strokes, { speed: 900 });

    // blueprint grid, drawn fast without the pencil
    const grid: Stroke[] = [];
    for (let x = 100; x <= 1100; x += 100) grid.push(...sk.line(x, 190, x, 820, { color: BLUE, width: 0.5, opacity: 0.35 }, { roughness: 0.2 }));
    for (let y = 190; y <= 820; y += 100) grid.push(...sk.line(100, y, 1100, y, { color: BLUE, width: 0.5, opacity: 0.35 }, { roughness: 0.2 }));
    d.draw(grid, { speed: 14000, gap: 0, noPencil: true });

    // six panels, each: icon, category label, items as handwritten list, connected to a central "SYSTEM" node
    const cx = 600, cy = 455;
    d.draw(sk.circle(cx, cy, 90, { color: INK, tool: "ink", width: 2 }, { roughness: 1.2 }), { speed: 1200 });
    d.write(sk.label("SYSTEM", cx, cy + 5, 14, { color: INK }, "center").strokes, { speed: 900 });

    const cols = section.querySelectorAll<HTMLElement>(".skill");
    const slots: [number, number][] = [[230, 270], [600, 240], [970, 270], [230, 620], [600, 680], [970, 620]];
    skills.forEach((s, i) => {
      const [x, y] = slots[i];
      const above = y < cy;
      const ix = x, iy = above ? y - 40 : y + 50;
      d.draw(sk.line(cx + (x - cx) * 0.22, cy + (y - cy) * 0.22, x + (cx - x) * 0.18, y + (cy - y) * 0.18, { color: GRAPHITE, width: 1, dashed: true }), { speed: 1600 });
      d.draw(sk.rect(x - 125, iy - 50, 250, 215, { color: GRAPHITE, width: 1 }, { roughness: 1.4 }), { speed: 1800 });
      d.draw(icons[s.icon](sk, ix, iy), { speed: 1100 });
      d.write(sk.label(s.category.toUpperCase(), x, iy + 52, 13, { color: INK, width: 1.2 }, "center").strokes, { speed: 900 });
      s.items.forEach((item, k) => {
        d.write(sk.text(item, x, iy + 82 + k * 22, 16, { color: INK, width: 1 }, "scripts", 1, "center").strokes, { speed: 1300, gap: 0.004 });
      });
      const el = cols[i];
      if (el) d.reveal(el.querySelectorAll("[data-reveal]"), "-=0.2");
    });
      });
