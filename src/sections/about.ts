import { makeScene } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { about, identity } from "../content";

export const aboutScene = () =>
  makeScene("about", [1200, 640], (sk, d) => {
    const h = sk.text("About", 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });

    // portrait in the left column (x 80..440)
    const cx = 260, cy = 360;
    d.draw(sk.ellipse(cx, cy, 300, 360, { color: GRAPHITE, width: 1.1 }, { roughness: 1.8 }), { speed: 1500 });
    d.draw([
      ...sk.sketchPath(`M ${cx - 55} ${cy - 60} C ${cx - 60} ${cy - 130} ${cx + 60} ${cy - 130} ${cx + 55} ${cy - 60} C ${cx + 62} ${cy - 10} ${cx + 30} ${cy + 30} ${cx} ${cy + 32} C ${cx - 30} ${cy + 30} ${cx - 62} ${cy - 10} ${cx - 55} ${cy - 60} Z`, { color: INK, tool: "ink" }, { roughness: 0.7 }),
      ...sk.sketchPath(`M ${cx - 58} ${cy - 70} C ${cx - 40} ${cy - 150} ${cx + 50} ${cy - 150} ${cx + 58} ${cy - 66} C ${cx + 30} ${cy - 95} ${cx - 20} ${cy - 100} ${cx - 58} ${cy - 70} Z`, { color: INK, tool: "ink" }, { roughness: 0.9, fill: "#000", hachureGap: 5 }),
    ], { speed: 1100 });
    d.draw([
      ...sk.ellipse(cx - 24, cy - 42, 38, 28, { color: INK, tool: "ink", width: 1.4 }),
      ...sk.ellipse(cx + 24, cy - 42, 38, 28, { color: INK, tool: "ink", width: 1.4 }),
      ...sk.line(cx - 5, cy - 42, cx + 5, cy - 42, { color: INK, tool: "ink" }),
      ...sk.sketchPath(`M ${cx - 6} ${cy - 30} L ${cx - 10} ${cy - 8} L ${cx + 2} ${cy - 6}`, { color: INK, tool: "ink", width: 1.2 }),
      ...sk.sketchPath(`M ${cx - 16} ${cy + 8} Q ${cx} ${cy + 18} ${cx + 16} ${cy + 8}`, { color: INK, tool: "ink", width: 1.2 }),
    ], { speed: 900 });
    d.draw([
      ...sk.sketchPath(`M ${cx - 120} ${cy + 170} C ${cx - 120} ${cy + 80} ${cx - 60} ${cy + 60} ${cx - 30} ${cy + 50} L ${cx} ${cy + 80} L ${cx + 30} ${cy + 50} C ${cx + 60} ${cy + 60} ${cx + 120} ${cy + 80} ${cx + 120} ${cy + 170}`, { color: INK, tool: "ink" }, { roughness: 0.9 }),
      ...sk.sketchPath(`M ${cx - 30} ${cy + 50} L ${cx - 14} ${cy + 72} L ${cx} ${cy + 60} L ${cx + 14} ${cy + 72} L ${cx + 30} ${cy + 50}`, { color: INK, tool: "ink", width: 1.2 }),
    ], { speed: 1200 });
    d.draw(sk.rect(cx - 120, cy + 190, 240, 40, { color: GRAPHITE }, { roughness: 1.2 }), { speed: 1600 });
    d.write(sk.label(identity.fullName.toUpperCase(), cx, cy + 217, 16, { color: INK }, "center").strokes, { speed: 900 });

    // text column (x 520..1140): intro, approach, tags
    const tx = 520, tw = 620;
    d.write(sk.label("WHO I AM", tx, 190, 11, { color: GRAPHITE }).strokes, { speed: 1000 });
    const intro = sk.paragraph(about.intro, tx, 222, 18, tw, { color: INK });
    d.write(intro.strokes, { speed: 1700, gap: 0.003 });
    let y = 222 + intro.height + 36;
    d.write(sk.label("HOW I APPROACH ENGINEERING PROBLEMS", tx, y, 11, { color: GRAPHITE }).strokes, { speed: 1000 });
    const b = sk.bullets(about.approach, tx, y + 32, 17, tw, { color: INK });
    d.write(b.strokes, { speed: 1700, gap: 0.003 });
    y = y + 32 + b.height + 30;
    let x = tx;
    for (const t of about.annotations) { const tg = sk.tag(t.toUpperCase(), x, y, 11); d.draw(tg.strokes, { speed: 1400 }); x += tg.width + 12; }
  });
