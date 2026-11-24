import { makeScene } from "./scene";
import { INK, GRAPHITE, RED } from "../engine/sketch";
import { railTrack, compassRose, gear, monitor, documentStack } from "./doodles";
import { C } from "../i18n";

export const experienceScene = () =>
  makeScene("experience", [1200, 600], (sk, d, section) => {
    const { experience, ui } = C();
    const h = sk.text(ui.headings.experience, 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });

    // the timeline: a long line with a start tick and an arrowhead pointing to the future
    const y = 300;
    d.draw(sk.arrow(90, y, 1120, y, { color: INK, tool: "ink", width: 1.8 }, 14), { speed: 1800 });
    // the timeline is a rail track: sleepers under the line, a nod to the company
    d.draw(railTrack(sk, 94, 1100, y), { speed: 6000, gap: 0, noPencil: true });
    d.draw(compassRose(sk, 760, 70, 20), { speed: 1800 });
    d.draw(sk.line(90, y - 14, 90, y + 14, { color: INK, tool: "ink", width: 1.8 }), { speed: 1200 });
    d.write(sk.label(ui.now, 1120, y - 20, 11, { color: GRAPHITE }, "right").strokes, { speed: 900 });

    const items = section.querySelectorAll<HTMLElement>(".job");
    const n = experience.length;
    experience.slice().forEach((job, i) => {
      // chronological left to right: oldest first
      const idx = n - 1 - i;
      const x = n === 1 ? 420 : 240 + (idx * 560) / (n - 1);
      // marker: a circle on the line, a leader up to the company, a leader down to the role
      d.draw(sk.circle(x, y, 18, { color: INK, tool: "ink", width: 1.8 }, { fill: "#000", hachureGap: 4 }), { speed: 1000 });
      d.draw(sk.line(x, y - 9, x, y - 70, { color: GRAPHITE, width: 1.1 }), { speed: 1400 });
      d.write(sk.text(job.company, x, y - 82, 30, { color: INK, width: 1.7 }, "scriptc", 2, "center").strokes, { speed: 900 });
      d.write(sk.label(job.period.toUpperCase(), x, y - 128, 12, { color: GRAPHITE }, "center").strokes, { speed: 900 });
      d.draw(sk.line(x, y + 9, x, y + 60, { color: GRAPHITE, width: 1.1 }), { speed: 1400 });
      d.write(sk.label(job.role.toUpperCase(), x, y + 84, 16, { color: INK, width: 1.3 }, "center").strokes, { speed: 1000 });
      // responsibilities as handwritten annotations
      // responsibilities as a tick list that flows with its own line breaks
      const bl = sk.bullets(job.points, x - 150, y + 130, 14, 330, { color: INK });
      d.write(bl.strokes, { speed: 1300, gap: 0.004 });
      if (i === 0) {
        // what the work looks like: a screen, a gear, a stack of documents, above the line on the right
        d.draw(monitor(sk, 900, y - 266, 92, 60), { speed: 1800 });
        d.draw(gear(sk, 1038, y - 234, 15, 8), { speed: 1600 });
        d.draw(documentStack(sk, 1074, y - 264), { speed: 1800 });
      }
      const el = items[i];
      if (el) d.reveal(el.querySelectorAll("[data-reveal]"), "-=0.2");
    });
    // a faint "future" dashed continuation and a note
    d.draw(sk.line(1120, y, 1180, y, { color: GRAPHITE, dashed: true, width: 1 }), { speed: 1200, noPencil: true });
  });
