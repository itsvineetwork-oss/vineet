import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { books, lightbulb, coffee } from "./doodles";
import { credentials } from "../content";
import { C } from "../i18n";

export const educationScene = () =>
  makeScene("education", [1200, 740], (sk, d, section) => {
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

    // study-desk details on the right
    d.draw(books(sk, 990, 380, 100), { speed: 1800 });
    d.draw(lightbulb(sk, 1110, 280, 20), { speed: 1600 });
    d.draw(coffee(sk, 1000, 240, 0.9), { speed: 1600 });
    // the degree, handwritten
    let y = 440;
    education.forEach((e, i) => {
      const size = i === 0 ? 30 : 22;
      d.write(sk.text(e.degree, 90, y, size, { color: INK, width: i === 0 ? 1.6 : 1.3 }, "scriptc", 2).strokes, { speed: 950, gap: 0.012 });
      const meta = [e.institution, e.period].filter(Boolean).join("  -  ");
      if (meta) d.write(sk.label(meta.toUpperCase(), 92, y + 28, 11, { color: GRAPHITE }).strokes, { speed: 900 });
      let h = 36;
      if (e.notes.length) { const b = sk.bullets(e.notes, 92, y + 62, 15, 900, { color: INK }); d.write(b.strokes, { speed: 1700, gap: 0.003 }); h = 62 + b.height; }
      y += h + 26;
    });
    // certifications as drawn double-line stamps
    if (credentials.length) {
      d.write(sk.label("CERTIFICATIONS", 92, y + 4, 10, { color: GRAPHITE }).strokes, { speed: 900 });
      let x = 92;
      let sy = y + 34;
      credentials.forEach((c, i) => {
        let t = sk.label(c.label.toUpperCase(), x + 12, sy, 10, { color: RED });
        let w = t.width + 24;
        if (x + w > 1140) { t.strokes.forEach((s) => s.el.remove()); x = 92; sy += 36; t = sk.label(c.label.toUpperCase(), x + 12, sy, 10, { color: RED }); w = t.width + 24; }
        d.draw([...sk.rect(x, sy - 15, w, 24, { color: RED, width: 1.2 }, { roughness: 1 }), ...sk.rect(x + 3, sy - 12, w - 6, 18, { color: RED, width: 0.8 }, { roughness: 0.6 })], { speed: 2200, noPencil: true });
        d.write(t.strokes, { speed: 1100 });
        x += w + 14;
        void i;
      });
    }
    d.reveal(revealables(section), "-=0.2");
  });
