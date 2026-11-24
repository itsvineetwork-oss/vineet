import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED, BLUE } from "../engine/sketch";
import { contact } from "../content";

export const contactScene = () =>
  makeScene("contact", [1200, 560], (sk, d, section) => {
    const h = sk.text("Contact", 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });
    d.write(sk.label("LAST PAGE OF THE SKETCHBOOK", 72, 160, 11, { color: GRAPHITE }).strokes, { speed: 900 });

    // envelope
    const ex = 300, ey = 300;
    d.draw([
      ...sk.rect(ex - 150, ey - 90, 300, 180, { color: INK, tool: "ink", width: 1.8 }, { roughness: 1.2 }),
      ...sk.sketchPath(`M ${ex - 150} ${ey - 90} L ${ex} ${ey + 10} L ${ex + 150} ${ey - 90}`, { color: INK, tool: "ink", width: 1.8 }),
      ...sk.sketchPath(`M ${ex - 150} ${ey + 90} L ${ex - 40} ${ey - 20} M ${ex + 150} ${ey + 90} L ${ex + 40} ${ey - 20}`, { color: GRAPHITE, width: 1.2 }),
      ...sk.rect(ex + 80, ey - 70, 46, 46, { color: RED, width: 1.2 }, { fill: "#000", hachureGap: 5 }),
    ], { speed: 1300 });
    d.write(sk.text("say hello", ex, ey + 150, 30, { color: BLUE, width: 1.5 }, "scripts", 2, "center").strokes, { speed: 900 });

    // contact card on the right, with lines for the real links underneath (HTML)
    const cx = 640, cy = 230;
    d.draw(sk.rect(cx, cy, 460, 200, { color: INK, tool: "ink", width: 1.6 }, { roughness: 1.3 }), { speed: 1600 });
    d.draw(sk.line(cx, cy + 50, cx + 460, cy + 50, { color: GRAPHITE }), { speed: 2000 });
    d.write(sk.label("VINEET SHARMA  ·  SOFTWARE DEVELOPER", cx + 20, cy + 32, 13, { color: INK }).strokes, { speed: 900 });
    const rows: [string, string][] = [["EMAIL", contact.email], ["LINKEDIN", contact.linkedin.replace(/^https?:\/\/(www\.)?/, "")], ["GITHUB", contact.github.replace(/^https?:\/\/(www\.)?/, "")]];
    rows.forEach(([k, v], i) => {
      d.write(sk.label(k, cx + 20, cy + 90 + i * 40, 11, { color: GRAPHITE }).strokes, { speed: 900 });
      d.draw(sk.line(cx + 110, cy + 94 + i * 40, cx + 430, cy + 94 + i * 40, { color: GRAPHITE, width: 0.8 }, { roughness: 0.6 }), { speed: 2000, noPencil: true });
      if (v) d.write(sk.label(v, cx + 118, cy + 90 + i * 40, 12, { color: INK }).strokes, { speed: 1200 });
    });
    d.write(sk.paragraph("Open to software and automation work. The fastest way to reach me is email.", cx, cy + 236, 15, 460, { color: INK }).strokes, { speed: 1700, gap: 0.003 });
    d.reveal(revealables(section), "-=0.4");
    // a final signature
    d.write(sk.text("- Vineet", 1100, 540, 32, { color: INK, width: 1.6 }, "scriptc", 2, "right").strokes, { speed: 800 });
  });
