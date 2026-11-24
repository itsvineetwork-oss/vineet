import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { identity } from "../content";

export const home = () =>
  makeScene("home", [1200, 600], (sk, d, section) => {
    // drawing sheet: double border and a title block in the corner
    d.draw(sk.rect(50, 40, 1100, 520, { color: GRAPHITE, width: 1.2 }, { roughness: 1.4 }), { speed: 1800 });
    d.draw(sk.rect(62, 52, 1076, 496, { color: GRAPHITE, width: 0.8 }, { roughness: 0.5 }), { speed: 3000, noPencil: true });
    d.write(sk.label("SHEET 01 / 07  -  PORTFOLIO", 84, 84, 11, { color: GRAPHITE }).strokes, { speed: 1000 });

    // name, written stroke by stroke, then underlined in red
    const name = sk.text(identity.name, 90, 230, 112, { color: INK, width: 3 }, "scriptc", 6);
    d.write(name.strokes, { speed: 950, gap: 0.03 });
    d.draw(sk.line(92, 250, 92 + name.width, 246, { color: RED, width: 2.2, tool: "marker" }, { roughness: 1.6 }), { speed: 1800 });

    // title and tagline, wrapped inside the left column so nothing crosses the laptop
    d.write(sk.label(identity.title.toUpperCase(), 94, 296, 18, { color: INK, width: 1.4 }).strokes, { speed: 1100 });
    d.write(sk.paragraph(identity.tagline, 94, 340, 19, 560, { color: INK }).strokes, { speed: 1500, gap: 0.004 });
    d.reveal(revealables(section), "-=0.2");

    // laptop in the right column
    const lx = 790, ly = 250;
    d.draw([
      ...sk.rect(lx, ly, 260, 160, { color: INK, tool: "ink", width: 1.6 }),
      ...sk.rect(lx + 12, ly + 12, 236, 136, { color: GRAPHITE, width: 1 }),
      ...sk.polygon([[lx - 30, ly + 160], [lx + 290, ly + 160], [lx + 310, ly + 190], [lx - 50, ly + 190]], { color: INK, tool: "ink", width: 1.6 }),
      ...sk.line(lx + 95, ly + 175, lx + 165, ly + 175, { color: GRAPHITE }),
    ], { speed: 1400, at: "-=0.8" });
    d.draw([
      ...sk.line(lx + 32, ly + 42, lx + 120, ly + 42, { color: GRAPHITE }),
      ...sk.line(lx + 50, ly + 62, lx + 190, ly + 62, { color: GRAPHITE }),
      ...sk.line(lx + 50, ly + 82, lx + 150, ly + 82, { color: GRAPHITE }),
      ...sk.line(lx + 32, ly + 102, lx + 100, ly + 102, { color: GRAPHITE }),
      ...sk.line(lx + 50, ly + 122, lx + 210, ly + 122, { color: RED, width: 1.2 }),
    ], { speed: 2000 });
    d.draw(sk.dimension(lx - 50, ly + 215, lx + 310, "360", { color: GRAPHITE, width: 1 }), { speed: 1800 });

    // title block, bottom right, like a real sheet
    const bx = 720, by = 470, bw = 418, c2 = 180;
    d.draw([...sk.rect(bx, by, bw, 66, { color: GRAPHITE, width: 1 }, { roughness: 0.6 }), ...sk.line(bx, by + 33, bx + bw, by + 33, { color: GRAPHITE, width: 0.8 }), ...sk.line(bx + c2, by, bx + c2, by + 66, { color: GRAPHITE, width: 0.8 })], { speed: 2600, noPencil: true });
    d.write([
      ...sk.label("DRAWN BY", bx + 10, by + 13, 8, { color: GRAPHITE }).strokes, ...sk.label(identity.fullName.toUpperCase(), bx + 10, by + 27, 10, { color: INK }).strokes,
      ...sk.label("TITLE", bx + c2 + 10, by + 13, 8, { color: GRAPHITE }).strokes, ...sk.label("LIVE SKETCH PORTFOLIO", bx + c2 + 10, by + 27, 10, { color: INK }).strokes,
      ...sk.label("SCALE", bx + 10, by + 46, 8, { color: GRAPHITE }).strokes, ...sk.label("1 : 1", bx + 10, by + 60, 10, { color: INK }).strokes,
      ...sk.label("SHEET", bx + c2 + 10, by + 46, 8, { color: GRAPHITE }).strokes, ...sk.label("01 OF 07", bx + c2 + 10, by + 60, 10, { color: INK }).strokes,
    ], { speed: 1300 });
  });
