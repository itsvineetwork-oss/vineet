import { makeScene, revealables } from "./scene";
import { Sketcher, INK, GRAPHITE, RED, BLUE, type Stroke } from "../engine/sketch";
import { Director } from "../engine/director";
import { projects } from "../content";

/** A node box with a title, used by the diagrams. */
function node(sk: Sketcher, x: number, y: number, w: number, h: number, text: string, color = INK) {
  const s = sk.rect(x, y, w, h, { color, tool: "ink", width: 1.5 }, { roughness: 1.1 });
  const t = sk.label(text, x + w / 2, y + h / 2 + 5, 13, { color }, "center");
  return [...s, ...t.strokes];
}

/** Database cylinder. */
function db(sk: Sketcher, cx: number, y: number, w: number, h: number, color = INK): Stroke[] {
  return [
    ...sk.ellipse(cx, y, w, w * 0.35, { color, tool: "ink", width: 1.5 }),
    ...sk.line(cx - w / 2, y, cx - w / 2, y + h, { color, tool: "ink", width: 1.5 }),
    ...sk.line(cx + w / 2, y, cx + w / 2, y + h, { color, tool: "ink", width: 1.5 }),
    ...sk.sketchPath(`M ${cx - w / 2} ${y + h} A ${w / 2} ${w * 0.175} 0 0 0 ${cx + w / 2} ${y + h}`, { color, tool: "ink", width: 1.5 }),
    ...sk.sketchPath(`M ${cx - w / 2} ${y + h / 2} A ${w / 2} ${w * 0.175} 0 0 0 ${cx + w / 2} ${y + h / 2}`, { color: GRAPHITE, width: 1 }),
  ];
}

function erpDiagram(sk: Sketcher, d: Director, ox: number, oy: number) {
  const y = oy + 40;
  d.draw(node(sk, ox, y, 150, 56, "FRONTEND"), { speed: 1200 });
  d.write(sk.label("Next.js · React", ox + 75, y + 76, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  d.draw(sk.arrow(ox + 150, y + 28, ox + 200, y + 28, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 200, y, 110, 56, "API"), { speed: 1200 });
  d.write(sk.label("FastAPI", ox + 255, y + 76, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  d.draw(sk.arrow(ox + 310, y + 28, ox + 360, y + 28, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 360, y - 10, 170, 76, "BACKEND SERVICES"), { speed: 1200 });
  d.write(sk.label("SQLAlchemy · jobs", ox + 445, y + 86, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  d.draw(sk.arrow(ox + 530, y + 28, ox + 590, y + 28, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(db(sk, ox + 640, y - 4, 90, 70), { speed: 1200 });
  d.write(sk.label("PostgreSQL", ox + 640, y + 96, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  // integrations hanging off the backend
  d.draw(sk.line(ox + 445, y + 66, ox + 445, y + 130, { color: BLUE, dashed: true }), { speed: 1400 });
  d.draw(node(sk, ox + 330, y + 130, 110, 40, "ENTRA ID", BLUE), { speed: 1300 });
  d.draw(node(sk, ox + 452, y + 130, 120, 40, "SHAREPOINT", BLUE), { speed: 1300 });
  d.draw(sk.line(ox + 385, y + 130, ox + 445, y + 100, { color: BLUE, width: 1 }), { speed: 1400 });
  d.draw(sk.line(ox + 512, y + 130, ox + 445, y + 100, { color: BLUE, width: 1 }), { speed: 1400 });
  // deployment bracket
  d.draw(sk.sketchPath(`M ${ox - 10} ${y + 200} L ${ox - 10} ${y + 212} L ${ox + 700} ${y + 212} L ${ox + 700} ${y + 200}`, { color: GRAPHITE, width: 1 }), { speed: 2000 });
  d.write(sk.label("DOCKER ON A VPS", ox + 345, y + 232, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  // a red annotation
  d.draw(sk.arrow(ox + 160, y - 50, ox + 120, y - 4, { color: RED, width: 1.1 }, 7), { speed: 1400 });
  d.write(sk.text("single system of record", ox + 165, y - 52, 17, { color: RED, width: 1.1 }, "scripts").strokes, { speed: 1000 });
}

function calculatorDiagram(sk: Sketcher, d: Director, ox: number, oy: number) {
  const y = oy + 40;
  d.draw(node(sk, ox, y, 130, 50, "INPUTS"), { speed: 1200 });
  d.draw(sk.arrow(ox + 130, y + 25, ox + 190, y + 25, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 190, y - 10, 170, 70, "VALIDATE"), { speed: 1200 });
  d.draw(sk.arrow(ox + 360, y + 25, ox + 420, y + 25, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 420, y - 10, 170, 70, "CALCULATE"), { speed: 1200 });
  d.draw(sk.arrow(ox + 590, y + 25, ox + 650, y + 25, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 650, y, 130, 50, "REPORT"), { speed: 1200 });
  // a formula and a small graph underneath
  d.write(sk.text("stress = F / A", ox + 200, y + 140, 28, { color: INK, width: 1.5 }, "timesi").strokes, { speed: 900 });
  const gx = ox + 470, gy = y + 90;
  d.draw([...sk.arrow(gx, gy + 90, gx + 200, gy + 90, { color: GRAPHITE }), ...sk.arrow(gx, gy + 90, gx, gy, { color: GRAPHITE })], { speed: 1500 });
  d.draw(sk.curve([[gx + 10, gy + 80], [gx + 60, gy + 60], [gx + 120, gy + 55], [gx + 180, gy + 15]], { color: RED, width: 1.6 }), { speed: 1200 });
  d.write(sk.label("python", gx + 100, gy + 110, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
}

function automationDiagram(sk: Sketcher, d: Director, ox: number, oy: number) {
  const y = oy + 50;
  // clock → script → three targets
  d.draw([...sk.circle(ox + 50, y + 30, 70, { color: INK, tool: "ink", width: 1.5 }), ...sk.line(ox + 50, y + 30, ox + 50, y + 6, { color: INK, tool: "ink" }), ...sk.line(ox + 50, y + 30, ox + 68, y + 38, { color: INK, tool: "ink" })], { speed: 1200 });
  d.write(sk.label("SCHEDULE", ox + 50, y + 90, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  d.draw(sk.arrow(ox + 90, y + 30, ox + 160, y + 30, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 160, y, 180, 60, "PYTHON JOB"), { speed: 1200 });
  const targets = ["REPORTS", "DATA SYNC", "DOCUMENTS"];
  targets.forEach((t, i) => {
    const ty = y - 60 + i * 80;
    d.draw(sk.arrow(ox + 340, y + 30, ox + 430, ty + 24, { color: GRAPHITE, width: 1.2 }), { speed: 1400 });
    d.draw(node(sk, ox + 430, ty, 150, 48, t), { speed: 1300 });
  });
  d.draw(db(sk, ox + 680, y - 20, 80, 70), { speed: 1200 });
  d.draw(sk.arrow(ox + 580, y + 24, ox + 636, y + 24, { color: GRAPHITE, dashed: true }), { speed: 1400 });
  d.write(sk.text("hours → minutes", ox + 440, y + 175, 20, { color: RED, width: 1.1 }, "scripts").strokes, { speed: 1000 });
}

const diagrams = { erp: erpDiagram, calculator: calculatorDiagram, automation: automationDiagram };

export const projectsScene = () =>
  makeScene("projects", [1200, 200], (sk, d) => {
    const h = sk.text("Projects", 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });
    d.write(sk.label("ENGINEERING NOTEBOOK  -  SELECTED WORK", 72, 160, 11, { color: GRAPHITE }).strokes, { speed: 900 });
  });

/** One scene per project: index number, handwritten title, its diagram, optional screenshots, then the real text. */
export const projectScenes = () =>
  projects.map((p, i) => {
    const el = document.getElementById(`p-${p.id}`) as HTMLElement;
    return makeScene(`p-${p.id}`, [1200, 400], (sk, d, section) => {
      d.draw(sk.line(70, 20, 1130, 20, { color: GRAPHITE, width: 0.8 }, { roughness: 0.5 }), { speed: 3000, noPencil: true });
      d.write(sk.label(`0${i + 1}`, 72, 60, 22, { color: RED, width: 1.6 }).strokes, { speed: 900 });
      d.write(sk.text(p.name, 130, 62, 36, { color: INK, width: 1.8 }, "scriptc", 2).strokes, { speed: 900, gap: 0.015 });
      if (p.diagram) diagrams[p.diagram](sk, d, 150, 90);
      (p.images || []).slice(0, 2).forEach((src, j) => {
        const r = sk.image(src, 880 + j * 20, 100 + j * 30, 240, 150, { color: GRAPHITE });
        d.draw(r.frame, { speed: 1600 }).draw(r.hatch, { speed: 5000, noPencil: true }).revealImage(r);
      });
      d.reveal(revealables(section), "-=0.3", 0.05);
    }, el);
  });
