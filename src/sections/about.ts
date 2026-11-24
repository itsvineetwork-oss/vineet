import { makeScene } from "./scene";
import { INK, GRAPHITE, RED, HIGHLIGHT } from "../engine/sketch";
import { C } from "../i18n";
import { exists, url } from "../engine/assets";
import { smoothPolyline } from "../engine/hershey";
import portrait from "../data/portrait.json";

export const aboutScene = () =>
  makeScene("about", [1200, 640], (sk, d) => {
    const { about, identity, ui } = C();
    const h = sk.text(ui.headings.about, 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });

    // left column (x 80..440): a real photo, sketched then revealed, or a clean monogram medallion
    const cx = 260, cy = 370;
    if (portrait.contours.length) {
      // the portrait is drawn from traced pencil lines: contours first, then two passes of hatching for tone
      const ox = cx - portrait.w / 2, oy = cy - 180;
      d.draw(sk.construction(ox - 10, oy - 10, portrait.w + 20, portrait.h + 20), { speed: 9000, gap: 0, noPencil: true });
      d.draw(sk.rect(ox - 10, oy - 10, portrait.w + 20, portrait.h + 20, { color: GRAPHITE, width: 1 }, { roughness: 1.2 }), { speed: 2000 });
      d.draw(sk.registration(ox - 10, oy - 10, portrait.w + 20, portrait.h + 20), { speed: 4000, gap: 0, noPencil: true });
      const lines = portrait.contours.map((c) => sk.path(smoothPolyline(c.map(([x, y]) => [x + ox, y + oy] as [number, number])), { tool: "ink", color: INK, width: 1.4 }));
      d.draw(lines, { speed: 2200, gap: 0.002 });
      const hatchPath = (groups: number[][][], st: { width: number; opacity: number }) =>
        groups.map((segs) => sk.path(segs.map(([x1, y1, x2, y2]) => `M${(x1 + ox).toFixed(1)},${(y1 + oy).toFixed(1)} L${(x2 + ox).toFixed(1)},${(y2 + oy).toFixed(1)}`).join(" "), { tool: "pencil", color: GRAPHITE, ...st }));
      d.draw(hatchPath(portrait.hatch, { width: 0.9, opacity: 0.7 }), { speed: 7000, gap: 0, noPencil: true });
      d.draw(hatchPath(portrait.cross, { width: 0.9, opacity: 0.8 }), { speed: 7000, gap: 0, noPencil: true });
    } else if (exists(about.photo)) {
      const r = sk.image(url(about.photo), cx - 140, cy - 180, 280, 340, { color: GRAPHITE });
      d.draw(r.frame, { speed: 1600 }).draw(r.hatch, { speed: 6000, noPencil: true }).revealImage(r);
    } else {
      d.draw(sk.circle(cx, cy, 300, { color: INK, tool: "ink", width: 2 }, { roughness: 1.1 }), { speed: 1500 });
      d.draw(sk.circle(cx, cy, 276, { color: GRAPHITE, width: 1 }, { roughness: 0.6 }), { speed: 2600, noPencil: true });
      // compass ticks around the ring
      const ticks: ReturnType<typeof sk.line> = [];
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2, big = i % 9 === 0, r1 = 138, r2 = big ? 124 : 131;
        ticks.push(...sk.line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, { color: big ? INK : GRAPHITE, width: big ? 1.6 : 1 }, { roughness: 0.3 }));
      }
      d.draw(ticks, { speed: 3000, noPencil: true });
      d.write(sk.text("V", cx + 6, cy + 48, 150, { color: INK, width: 4 }, "scriptc", 0, "center").strokes, { speed: 900, gap: 0.03 });
      d.draw(sk.line(cx - 60, cy + 72, cx + 60, cy + 70, { color: RED, width: 2.2, tool: "marker" }, { roughness: 1.4 }), { speed: 1600 });
      d.write(sk.label("SOFTWARE DEVELOPER", cx, cy + 100, 10, { color: GRAPHITE }, "center").strokes, { speed: 1000 });
    }
    // kraft-paper tape strips over two corners of the frame
    const tape = (tx: number, ty: number, rot: number) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `rotate(${rot} ${tx} ${ty})`);
      sk.layer.appendChild(g);
      const s = sk.path(`M${tx - 34},${ty - 9} L${tx + 34},${ty - 9} L${tx + 34},${ty + 9} L${tx - 34},${ty + 9} Z`, { color: "var(--tape)", width: 1, opacity: 0.85, className: "sk-tape" }, g);
      s.el.setAttribute("fill", "var(--tape)");
      return [s];
    };
    d.draw([...tape(cx - 140 + 8, cy - 180 + 4, -28), ...tape(cx + 140 - 8, cy + 160 - 4, -26)], { speed: 2200, noPencil: true });
    d.draw(sk.rect(cx - 120, cy + 190, 240, 40, { color: GRAPHITE }, { roughness: 1.2 }), { speed: 1600 });
    d.write(sk.label(identity.fullName.toUpperCase(), cx, cy + 217, 16, { color: INK }, "center").strokes, { speed: 900 });

    // text column (x 520..1140): intro, approach, tags
    const tx = 520, tw = 620;
    d.write(sk.label(ui.whoIAm, tx, 190, 11, { color: GRAPHITE }).strokes, { speed: 1000 });
    const intro = sk.paragraph(about.intro, tx, 222, 18, tw, { color: INK });
    // highlighter under the first line (the thesis)
    d.draw([sk.highlight(tx, 222, Math.min(tw, intro.strokes.length ? tw * 0.92 : tw), 18, HIGHLIGHT)], { speed: 2600, noPencil: true });
    d.write(intro.strokes, { speed: 1700, gap: 0.003 });
    let y = 222 + intro.height + 36;
    d.write(sk.label(ui.approach, tx, y, 11, { color: GRAPHITE }).strokes, { speed: 1000 });
    const b = sk.bullets(about.approach, tx, y + 32, 17, tw, { color: INK });
    d.write(b.strokes, { speed: 1700, gap: 0.003 });
    y = y + 32 + b.height + 30;
    let x = tx;
    for (const t of about.annotations) { const tg = sk.tag(t.toUpperCase(), x, y, 11); d.draw(tg.strokes, { speed: 1400 }); x += tg.width + 12; }
  });
