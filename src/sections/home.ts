import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { wavingHand, laptop, coffee, pencilDoodle } from "./doodles";
import { C } from "../i18n";

export const home = () =>
  makeScene("home", [1200, 600], (sk, d, section) => {
    const { identity } = C();
    // drawing sheet: double border and a title block in the corner
    d.draw(sk.rect(50, 40, 1100, 520, { color: GRAPHITE, width: 1.2 }, { roughness: 1.4 }), { speed: 1800 });
    d.draw(sk.rect(62, 52, 1076, 496, { color: GRAPHITE, width: 0.8 }, { roughness: 0.5 }), { speed: 3000, noPencil: true });
    d.draw(sk.registration(50, 40, 1100, 520, 7), { speed: 4000, gap: 0, noPencil: true });
    d.write(sk.label("SHEET 01 / 07  -  PORTFOLIO", 84, 84, 11, { color: GRAPHITE }).strokes, { speed: 1000 });

    // a waving hand first, then "Welcome," then "I am Vineet Sharma" in readable cursive, underlined in red
    d.draw(wavingHand(sk, 96, 128, 0.85), { speed: 1300 });
    const hello = sk.text(identity.welcome + ",", 180, 178, 44, { color: GRAPHITE, width: 1.7 }, "scripts", 2);
    d.write(hello.strokes, { speed: 900, gap: 0.02 });
    const iam = sk.text("I am", 94, 258, 36, { color: GRAPHITE, width: 1.5 }, "scripts", 2);
    d.write(iam.strokes, { speed: 900, gap: 0.02 });
    const name = sk.text(identity.name, 94 + iam.width + 18, 262, 50, { color: INK, width: 2.4 }, "scriptc", 2);
    d.write(name.strokes, { speed: 950, gap: 0.025 });
    d.draw(sk.line(94 + iam.width + 18, 280, 94 + iam.width + 18 + name.width, 276, { color: RED, width: 2.2, tool: "marker" }, { roughness: 1.6 }), { speed: 1800 });

    // title and tagline, wrapped inside the left column so nothing crosses the drawing
    const role = sk.label(identity.title.toUpperCase(), 94, 322, 16, { color: INK, width: 1.3 });
    d.draw([sk.highlight(94, 322, role.width, 16)], { speed: 2200, noPencil: true });
    d.write(role.strokes, { speed: 1100 });
    d.write(sk.paragraph(identity.tagline, 94, 362, 18, 560, { color: INK }).strokes, { speed: 1500, gap: 0.004 });
    d.reveal(revealables(section), "-=0.2");

    // a desk on the right: laptop with code, a coffee, a pencil
    d.draw(laptop(sk, 860, 150, 200), { speed: 1800 });
    d.draw(coffee(sk, 1096, 282, 0.75), { speed: 1600 });
    d.draw(pencilDoodle(sk, 836, 352, 100, -0.22), { speed: 1600 });
    d.write(sk.label("WHERE THE WORK HAPPENS", 1000, 400, 9, { color: GRAPHITE }, "center").strokes, { speed: 1000 });

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
