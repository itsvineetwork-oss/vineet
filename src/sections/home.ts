import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { C } from "../i18n";

export const home = () =>
  makeScene("home", [1200, 600], (sk, d, section) => {
    const { identity } = C();
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
    d.reveal(section.querySelectorAll(".strip"), "<");

    // right column: an isometric wireframe assembly inside a group that tilts with the mouse
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "iso");
    g.setAttribute("transform-origin", "880 330");
    sk.layer.appendChild(g);
    const cube = (cx: number, cy: number, sz: number, hgt: number, color = INK) => {
      const ax = sz * 0.866, ay = sz * 0.5; // 30 degree isometric
      const top: [number, number][] = [[cx, cy - ay], [cx + ax, cy], [cx, cy + ay], [cx - ax, cy]];
      const pts = [
        ...sk.polygon(top, { color, tool: "ink", width: 1.5 }, { roughness: 0.7 }),
        ...sk.line(cx - ax, cy, cx - ax, cy + hgt, { color, tool: "ink", width: 1.5 }, { roughness: 0.5 }),
        ...sk.line(cx, cy + ay, cx, cy + ay + hgt, { color, tool: "ink", width: 1.5 }, { roughness: 0.5 }),
        ...sk.line(cx + ax, cy, cx + ax, cy + hgt, { color, tool: "ink", width: 1.5 }, { roughness: 0.5 }),
        ...sk.line(cx - ax, cy + hgt, cx, cy + ay + hgt, { color, tool: "ink", width: 1.5 }, { roughness: 0.5 }),
        ...sk.line(cx, cy + ay + hgt, cx + ax, cy + hgt, { color, tool: "ink", width: 1.5 }, { roughness: 0.5 }),
        // hidden edges, dashed
        ...sk.line(cx - ax, cy + hgt, cx, cy - ay + hgt, { color: GRAPHITE, width: 0.9, dashed: true }, { roughness: 0.3 }),
        ...sk.line(cx, cy - ay + hgt, cx + ax, cy + hgt, { color: GRAPHITE, width: 0.9, dashed: true }, { roughness: 0.3 }),
        ...sk.line(cx, cy - ay, cx, cy - ay + hgt, { color: GRAPHITE, width: 0.9, dashed: true }, { roughness: 0.3 }),
      ];
      pts.forEach((p) => g.appendChild(p.el));
      return pts;
    };
    // three stacked blocks: data, services, interface
    d.draw(cube(880, 352, 104, 40), { speed: 1600 });
    d.draw(cube(880, 290, 80, 34, INK), { speed: 1600 });
    d.draw(cube(880, 238, 56, 26, INK), { speed: 1600 });
    const tag = (x: number, y: number, text: string) => { const t = sk.label(text, x, y, 10, { color: GRAPHITE }); t.strokes.forEach((p) => g.appendChild(p.el)); return t.strokes; };
    const lead = (x1: number, y1: number, x2: number, y2: number) => { const l = sk.line(x1, y1, x2, y2, { color: GRAPHITE, width: 0.9 }, { roughness: 0.3 }); l.forEach((p) => g.appendChild(p.el)); return l; };
    d.draw([...lead(972, 372, 1010, 372), ...tag(1016, 376, "DATA - POSTGRESQL")], { speed: 1800 });
    d.draw([...lead(950, 307, 1010, 307), ...tag(1016, 311, "API - FASTAPI")], { speed: 1800 });
    d.draw([...lead(930, 251, 1010, 251), ...tag(1016, 255, "UI - NEXT.JS")], { speed: 1800 });
    const dim = sk.dimension(790, 456, 970, "180", { color: GRAPHITE, width: 1 });
    dim.forEach((p) => g.appendChild(p.el));
    d.draw(dim, { speed: 1800 });

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
