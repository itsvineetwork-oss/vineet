import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { identity } from "../content";

export const home = () =>
  makeScene("home", [1200, 640], (sk, d, section) => {
    // 1. the frame, like the border of a drawing sheet
    const frame = sk.rect(60, 40, 1080, 560, { color: GRAPHITE, width: 1.2 }, { roughness: 1.6 });
    const inner = sk.rect(72, 52, 1056, 536, { color: GRAPHITE, width: 0.8 }, { roughness: 0.6 });
    const title = sk.label("SHEET 01  ·  PORTFOLIO  ·  V. SHARMA", 90, 78, 11, { color: GRAPHITE });
    d.draw(frame, { speed: 1600 }).draw(inner, { speed: 2400, noPencil: true }).write(title.strokes, { speed: 900 });

    // 2. the name, written stroke by stroke
    const name = sk.text(identity.name, 110, 250, 120, { color: INK, width: 3.2 }, "scriptc", 6);
    d.write(name.strokes, { speed: 950, gap: 0.03 });
    const under = sk.line(110, 268, 110 + name.width, 262, { color: RED, width: 2.2, tool: "marker" }, { roughness: 2 });
    d.draw(under, { speed: 1800 });

    // 3. title and tagline in technical lettering
    const role = sk.label(identity.title.toUpperCase(), 112, 310, 18, { color: INK, width: 1.4 });
    d.write(role.strokes, { speed: 1100 });
    d.reveal(revealables(section), "-=0.2");

    // 4. a laptop on the right
    const lx = 820, ly = 300;
    const laptop = [
      ...sk.polygon([[lx, ly], [lx + 240, ly], [lx + 240, ly + 150], [lx, ly + 150]], { color: INK, tool: "ink" }),
      ...sk.rect(lx + 12, ly + 12, 216, 126, { color: GRAPHITE, width: 1 }),
      ...sk.polygon([[lx - 30, ly + 150], [lx + 270, ly + 150], [lx + 290, ly + 180], [lx - 50, ly + 180]], { color: INK, tool: "ink" }),
      ...sk.line(lx + 90, ly + 165, lx + 150, ly + 165, { color: GRAPHITE }),
    ];
    const code = [
      ...sk.line(lx + 30, ly + 40, lx + 110, ly + 40, { color: GRAPHITE }),
      ...sk.line(lx + 46, ly + 58, lx + 170, ly + 58, { color: GRAPHITE }),
      ...sk.line(lx + 46, ly + 76, lx + 140, ly + 76, { color: GRAPHITE }),
      ...sk.line(lx + 30, ly + 94, lx + 90, ly + 94, { color: GRAPHITE }),
      ...sk.line(lx + 46, ly + 112, lx + 190, ly + 112, { color: RED, width: 1.2 }),
    ];
    d.draw(laptop, { speed: 1300, at: "-=0.6" }).draw(code, { speed: 1800 });

    // 5. small technical marks: a dimension line, a cog, a compass arc
    const dim = sk.dimension(lx - 30, ly + 205, lx + 290, "320", { color: GRAPHITE, width: 1 });
    const cog = sk.circle(760, 180, 46, { color: GRAPHITE, width: 1.1 }, { roughness: 1.3 });
    const cogIn = sk.circle(760, 180, 16, { color: GRAPHITE, width: 1.1 });
    const teeth: ReturnType<typeof sk.line> = [];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; teeth.push(...sk.line(760 + Math.cos(a) * 23, 180 + Math.sin(a) * 23, 760 + Math.cos(a) * 30, 180 + Math.sin(a) * 30, { color: GRAPHITE, width: 1.6 })); }
    const arc = sk.sketchPath("M 140 520 A 180 180 0 0 1 420 470", { color: GRAPHITE, width: 1 }, { roughness: 0.5 });
    const ticks: ReturnType<typeof sk.line> = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6; const a = Math.PI * 1.02 + t * 0.56; const cx = 320, cy = 680; ticks.push(...sk.line(cx + Math.cos(a) * 180, cy + Math.sin(a) * 180, cx + Math.cos(a) * 170, cy + Math.sin(a) * 170, { color: GRAPHITE })); }
    d.draw(dim, { speed: 1600 }).draw([...cog, ...cogIn, ...teeth], { speed: 1400, at: "-=0.4" }).draw([...arc, ...ticks], { speed: 1500, at: "-=0.3" });

    // 6. tagline handwritten, then the real HTML text + CTA reveal
    const tag = sk.text(identity.tagline, 112, 372, 22, { color: INK, width: 1.4 }, "scripts", 2);
    d.write(tag.strokes, { speed: 1300, gap: 0.005 });
  });
