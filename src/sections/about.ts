import { makeScene } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { C } from "../i18n";
import { exists, url } from "../engine/assets";

export const aboutScene = () =>
  makeScene("about", [1200, 640], (sk, d) => {
    const { about, identity, ui } = C();
    const h = sk.text(ui.headings.about, 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });

    // left column (x 80..440): a real photo, sketched then revealed, or a clean monogram medallion
    const cx = 260, cy = 370;
    if (exists(about.photo)) {
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
    d.draw(sk.rect(cx - 120, cy + 190, 240, 40, { color: GRAPHITE }, { roughness: 1.2 }), { speed: 1600 });
    d.write(sk.label(identity.fullName.toUpperCase(), cx, cy + 217, 16, { color: INK }, "center").strokes, { speed: 900 });

    // text column (x 520..1140): intro, approach, tags
    const tx = 520, tw = 620;
    d.write(sk.label(ui.whoIAm, tx, 190, 11, { color: GRAPHITE }).strokes, { speed: 1000 });
    const intro = sk.paragraph(about.intro, tx, 222, 18, tw, { color: INK });
    d.write(intro.strokes, { speed: 1700, gap: 0.003 });
    let y = 222 + intro.height + 36;
    d.write(sk.label(ui.approach, tx, y, 11, { color: GRAPHITE }).strokes, { speed: 1000 });
    const b = sk.bullets(about.approach, tx, y + 32, 17, tw, { color: INK });
    d.write(b.strokes, { speed: 1700, gap: 0.003 });
    y = y + 32 + b.height + 30;
    let x = tx;
    for (const t of about.annotations) { const tg = sk.tag(t.toUpperCase(), x, y, 11); d.draw(tg.strokes, { speed: 1400 }); x += tg.width + 12; }
  });
