import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { C } from "../i18n";

export const educationScene = () =>
  makeScene("education", [1200, 560], (sk, d, section) => {
    const { education, ui } = C();
    const h = sk.text(ui.headings.education, 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });

    // graduation cap
    const gx = 260, gy = 300;
    d.draw([
      ...sk.polygon([[gx, gy - 50], [gx + 110, gy - 10], [gx, gy + 30], [gx - 110, gy - 10]], { color: INK, tool: "ink", width: 1.8 }),
      ...sk.sketchPath(`M ${gx - 60} ${gy + 8} L ${gx - 60} ${gy + 50} C ${gx - 20} ${gy + 80} ${gx + 20} ${gy + 80} ${gx + 60} ${gy + 50} L ${gx + 60} ${gy + 8}`, { color: INK, tool: "ink", width: 1.6 }),
      ...sk.line(gx + 110, gy - 10, gx + 110, gy + 40, { color: INK, tool: "ink" }),
      ...sk.circle(gx + 110, gy + 46, 10, { color: INK, tool: "ink" }),
    ], { speed: 1200 });

    // notebook and certificate
    const nx = 560, ny = 250;
    d.draw([...sk.rect(nx, ny, 120, 150, { color: INK, tool: "ink" }), ...sk.line(nx + 18, ny, nx + 18, ny + 150, { color: GRAPHITE }), ...sk.line(nx + 36, ny + 40, nx + 100, ny + 40, { color: GRAPHITE }), ...sk.line(nx + 36, ny + 64, nx + 100, ny + 64, { color: GRAPHITE }), ...sk.line(nx + 36, ny + 88, nx + 90, ny + 88, { color: GRAPHITE })], { speed: 1300 });
    const cx = 760, cy = 260;
    d.draw([...sk.rect(cx, cy, 170, 120, { color: INK, tool: "ink" }, { roughness: 1.3 }), ...sk.rect(cx + 10, cy + 10, 150, 100, { color: GRAPHITE, width: 0.8 }), ...sk.line(cx + 40, cy + 40, cx + 130, cy + 40, { color: GRAPHITE }), ...sk.line(cx + 50, cy + 60, cx + 120, cy + 60, { color: GRAPHITE }), ...sk.circle(cx + 130, cy + 92, 20, { color: RED, width: 1.4 }, { fill: "#000", hachureGap: 4 })], { speed: 1300 });

    // the degree, handwritten
    education.forEach((e, i) => {
      const y = 440 + i * 60;
      d.write(sk.text(e.degree, 90, y, 30, { color: INK, width: 1.6 }, "scriptc", 2).strokes, { speed: 950, gap: 0.012 });
      const meta = [e.institution, e.period].filter(Boolean).join("  -  ");
      if (meta) d.write(sk.label(meta.toUpperCase(), 92, y + 30, 12, { color: GRAPHITE }).strokes, { speed: 900 });
      d.write(sk.bullets(e.notes, 92, y + (meta ? 66 : 44), 16, 900, { color: INK }).strokes, { speed: 1700, gap: 0.003 });
    });
    d.reveal(revealables(section), "-=0.2");
  });
