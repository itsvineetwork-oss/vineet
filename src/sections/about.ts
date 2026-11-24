import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED, BLUE } from "../engine/sketch";
import { about, identity } from "../content";

export const aboutScene = () =>
  makeScene("about", [1200, 620], (sk, d, section) => {
    const h = sk.text("About", 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });

    // portrait: an oval frame, head, shoulders, hair line, glasses
    const cx = 290, cy = 360;
    const oval = sk.ellipse(cx, cy, 300, 360, { color: GRAPHITE, width: 1.1 }, { roughness: 1.8 });
    const head = sk.sketchPath(`M ${cx - 55} ${cy - 60} C ${cx - 60} ${cy - 130} ${cx + 60} ${cy - 130} ${cx + 55} ${cy - 60} C ${cx + 62} ${cy - 10} ${cx + 30} ${cy + 30} ${cx} ${cy + 32} C ${cx - 30} ${cy + 30} ${cx - 62} ${cy - 10} ${cx - 55} ${cy - 60} Z`, { color: INK, tool: "ink" }, { roughness: 0.7 });
    const hair = sk.sketchPath(`M ${cx - 58} ${cy - 70} C ${cx - 40} ${cy - 150} ${cx + 50} ${cy - 150} ${cx + 58} ${cy - 66} C ${cx + 30} ${cy - 95} ${cx - 20} ${cy - 100} ${cx - 58} ${cy - 70} Z`, { color: INK, tool: "ink" }, { roughness: 0.9, fill: "#000", hachureGap: 5 });
    const glasses = [
      ...sk.ellipse(cx - 24, cy - 42, 38, 28, { color: INK, tool: "ink", width: 1.4 }),
      ...sk.ellipse(cx + 24, cy - 42, 38, 28, { color: INK, tool: "ink", width: 1.4 }),
      ...sk.line(cx - 5, cy - 42, cx + 5, cy - 42, { color: INK, tool: "ink" }),
    ];
    const face = [
      ...sk.sketchPath(`M ${cx - 6} ${cy - 30} L ${cx - 10} ${cy - 8} L ${cx + 2} ${cy - 6}`, { color: INK, tool: "ink", width: 1.2 }),
      ...sk.sketchPath(`M ${cx - 16} ${cy + 8} Q ${cx} ${cy + 18} ${cx + 16} ${cy + 8}`, { color: INK, tool: "ink", width: 1.2 }),
    ];
    const body = sk.sketchPath(`M ${cx - 120} ${cy + 170} C ${cx - 120} ${cy + 80} ${cx - 60} ${cy + 60} ${cx - 30} ${cy + 50} L ${cx} ${cy + 80} L ${cx + 30} ${cy + 50} C ${cx + 60} ${cy + 60} ${cx + 120} ${cy + 80} ${cx + 120} ${cy + 170}`, { color: INK, tool: "ink" }, { roughness: 0.9 });
    const collar = sk.sketchPath(`M ${cx - 30} ${cy + 50} L ${cx - 14} ${cy + 72} L ${cx} ${cy + 60} L ${cx + 14} ${cy + 72} L ${cx + 30} ${cy + 50}`, { color: INK, tool: "ink", width: 1.2 });
    d.draw(oval, { speed: 1500 }).draw([...head, ...hair], { speed: 1100 }).draw([...glasses, ...face], { speed: 900 }).draw([...body, ...collar], { speed: 1200 });

    // nameplate under the portrait
    const plate = sk.rect(cx - 120, cy + 190, 240, 40, { color: GRAPHITE }, { roughness: 1.2 });
    const nm = sk.label(identity.fullName.toUpperCase(), cx, cy + 217, 16, { color: INK }, "center");
    d.draw(plate, { speed: 1600 }).write(nm.strokes, { speed: 900 });

    // annotation arrows with handwritten notes around the portrait
    const notes = about.annotations;
    // [arrow tip x, arrow tip y, text x, text baseline y, side]
    const spots: [number, number, number, number, "left" | "right"][] = [
      [cx + 150, cy - 110, cx + 215, cy - 150, "right"],
      [cx + 160, cy + 20, cx + 225, cy + 40, "right"],
      [cx - 150, cy - 120, 60, cy - 170, "left"],
      [cx - 155, cy + 60, 60, cy + 120, "left"],
    ];
    notes.forEach((n, i) => {
      const [ax, ay, tx, ty, side] = spots[i % spots.length];
      const t = sk.text(n, tx, ty, 20, { color: BLUE, width: 1.2 }, "scripts", 1, "left");
      const fromX = side === "right" ? tx - 6 : tx + t.width + 6;
      d.draw(sk.arrow(fromX, ty - 6, ax, ay, { color: BLUE, width: 1.2 }, 8), { speed: 1400 });
      d.write(t.strokes, { speed: 1100 });
    });

    // three small icons on the right: code brackets, a gear and a flowchart
    const ix = 760, iy = 200;
    const icons = [
      ...sk.sketchPath(`M ${ix} ${iy} L ${ix - 28} ${iy + 30} L ${ix} ${iy + 60} M ${ix + 50} ${iy} L ${ix + 78} ${iy + 30} L ${ix + 50} ${iy + 60} M ${ix + 32} ${iy - 6} L ${ix + 18} ${iy + 66}`, { color: INK, tool: "ink", width: 1.6 }),
      ...sk.rect(ix + 150, iy, 80, 32, { color: INK, tool: "ink" }),
      ...sk.arrow(ix + 190, iy + 32, ix + 190, iy + 70, { color: GRAPHITE }),
      ...sk.polygon([[ix + 190, iy + 72], [ix + 240, iy + 100], [ix + 190, iy + 128], [ix + 140, iy + 100]], { color: INK, tool: "ink" }),
      ...sk.arrow(ix + 240, iy + 100, ix + 300, iy + 100, { color: GRAPHITE }),
      ...sk.rect(ix + 302, iy + 84, 80, 32, { color: INK, tool: "ink" }),
    ];
    d.draw(icons, { speed: 1300 });
    const cap = sk.label("BUILD  ·  AUTOMATE  ·  SHIP", ix + 190, iy + 170, 12, { color: GRAPHITE }, "center");
    d.write(cap.strokes, { speed: 900 });

    d.reveal(revealables(section), "-=0.3");
  });
