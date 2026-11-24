import { makeScene, revealables } from "./scene";
import { Sketcher, INK, GRAPHITE, RED, BLUE, type Stroke } from "../engine/sketch";
import { Director } from "../engine/director";
import { C } from "../i18n";
import { exists, url } from "../engine/assets";

let currentNotes: Record<string, string> = {};

/** A node box with a title, used by the diagrams. Nodes with a note get a hover spec card. */
function node(sk: Sketcher, x: number, y: number, w: number, h: number, text: string, color = INK) {
  const s = sk.rect(x, y, w, h, { color, tool: "ink", width: 1.5 }, { roughness: 1.1 });
  const t = sk.label(text, x + w / 2, y + h / 2 + 5, 13, { color }, "center");
  if (currentNotes[text]) sk.hotspot(x, y, w, h, text, currentNotes[text]);
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
  d.draw(node(sk, ox + 360, y - 10, 200, 76, "BACKEND SERVICES"), { speed: 1200 });
  d.write(sk.label("SQLAlchemy - jobs", ox + 460, y + 86, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  d.draw(sk.arrow(ox + 560, y + 28, ox + 600, y + 28, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(db(sk, ox + 650, y - 4, 90, 70), { speed: 1200 });
  d.write(sk.label("PostgreSQL", ox + 650, y + 96, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
  if (currentNotes["PostgreSQL"]) sk.hotspot(ox + 600, y - 24, 100, 125, "PostgreSQL", currentNotes["PostgreSQL"]);
  // integrations hanging off the backend
  d.draw(sk.line(ox + 460, y + 66, ox + 460, y + 104, { color: BLUE, dashed: true }), { speed: 1400 });
  d.draw(sk.line(ox + 460, y + 104, ox + 360, y + 134, { color: BLUE, width: 1 }), { speed: 1400 });
  d.draw(sk.line(ox + 460, y + 104, ox + 560, y + 134, { color: BLUE, width: 1 }), { speed: 1400 });
  d.draw(node(sk, ox + 290, y + 134, 130, 40, "ENTRA ID", BLUE), { speed: 1300 });
  d.draw(node(sk, ox + 480, y + 134, 160, 40, "SHAREPOINT", BLUE), { speed: 1300 });
  // a red annotation under the database
  d.draw(sk.arrow(ox + 680, y + 186, ox + 702, y + 66, { color: RED, width: 1.1 }, 7), { speed: 1400 });
  d.write(sk.text("single system of record", ox + 530, y + 204, 16, { color: RED, width: 1.1 }, "scripts", 1, "center").strokes, { speed: 1000 });
  // deployment bracket
  d.draw(sk.sketchPath(`M ${ox - 10} ${y + 222} L ${ox - 10} ${y + 234} L ${ox + 700} ${y + 234} L ${ox + 700} ${y + 222}`, { color: GRAPHITE, width: 1 }), { speed: 2000 });
  d.write(sk.label("DOCKER ON A VPS", ox + 345, y + 254, 11, { color: GRAPHITE }, "center").strokes, { speed: 900 });
}

function calculatorDiagram(sk: Sketcher, d: Director, ox: number, oy: number) {
  const y = oy + 40;
  d.draw(node(sk, ox, y, 110, 50, "INPUTS"), { speed: 1200 });
  d.draw(sk.arrow(ox + 110, y + 25, ox + 150, y + 25, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 150, y - 10, 150, 70, "VALIDATE"), { speed: 1200 });
  d.draw(sk.arrow(ox + 300, y + 25, ox + 340, y + 25, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 340, y - 10, 150, 70, "CALCULATE"), { speed: 1200 });
  d.draw(sk.arrow(ox + 490, y + 25, ox + 530, y + 25, { color: GRAPHITE, width: 1.3 }), { speed: 1400 });
  d.draw(node(sk, ox + 530, y, 110, 50, "REPORT"), { speed: 1200 });
  // a formula and a small graph underneath
  d.write(sk.text("stress = F / A", ox + 120, y + 150, 28, { color: INK, width: 1.5 }, "timesi").strokes, { speed: 900 });
  const gx = ox + 400, gy = y + 90;
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
  d.draw(db(sk, ox + 670, y - 20, 80, 70), { speed: 1200 });
  d.draw(sk.arrow(ox + 580, y + 24, ox + 626, y + 24, { color: GRAPHITE, dashed: true }), { speed: 1400 });
  d.write(sk.text("hours -> minutes", ox + 440, y + 186, 20, { color: RED, width: 1.1 }, "scripts").strokes, { speed: 1000 });
}

const diagrams = { erp: erpDiagram, calculator: calculatorDiagram, automation: automationDiagram };

export const projectsScene = () =>
  makeScene("projects", [1200, 190], (sk, d) => {
    const { ui } = C();
    const h = sk.text(ui.headings.projects, 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });
    d.write(sk.label(ui.notebook, 72, 160, 11, { color: GRAPHITE }).strokes, { speed: 900 });
  });

/** One scene per project: number and title, the diagram on the left, written notes on the right. */
export const projectScenes = () =>
  C().projects.map((p0, i) => {
    const el = document.getElementById(`p-${p0.id}`) as HTMLElement;
    return makeScene(`p-${p0.id}`, [1200, 520], (sk, d, section) => {
      const { ui } = C();
      const p = C().projects.find((x) => x.id === p0.id) ?? p0;
      currentNotes = p.nodes || {};
      d.draw(sk.line(70, 20, 1130, 20, { color: GRAPHITE, width: 0.8 }, { roughness: 0.5 }), { speed: 3000, noPencil: true });
      d.write(sk.label(`0${i + 1}`, 72, 64, 22, { color: RED, width: 1.6 }).strokes, { speed: 900 });
      d.write(sk.text(p.name, 130, 66, 36, { color: INK, width: 1.8 }, "scriptc", 2).strokes, { speed: 900, gap: 0.015 });
      if (p.diagram) diagrams[p.diagram](sk, d, 60, 90);

      // notes column
      const tx = 830, tw = 300;
      let y = 110;
      const block = (label: string, text: string) => {
        d.write(sk.label(label, tx, y, 10, { color: GRAPHITE }).strokes, { speed: 1000 });
        const para = sk.paragraph(text, tx, y + 24, 14, tw, { color: INK });
        d.write(para.strokes, { speed: 1800, gap: 0.002 });
        y += 24 + para.height + 18;
      };
      block(ui.problem, p.problem);
      block(ui.contribution, p.contribution);
      if (p.outcome) block(ui.outcome, p.outcome);
      // stack runs under the diagram, where there is room for the long list
      d.write(sk.label(ui.stack, 72, 424, 10, { color: GRAPHITE }).strokes, { speed: 1000 });
      d.write(sk.paragraph([...p.stack, ...(p.integrations || [])].join(", "), 72, 446, 14, 740, { color: INK }).strokes, { speed: 1800, gap: 0.002 });

      const shots = (p.images || []).filter(exists).slice(0, 2);
      shots.forEach((src, j) => {
        const r = sk.image(url(src), tx + j * 24, y + 10 + j * 20, 200, 125, { color: GRAPHITE });
        d.draw(r.frame, { speed: 1600 }).draw(r.hatch, { speed: 6000, noPencil: true }).revealImage(r);
      });
      if (shots.length) d.write(sk.label(ui.screenshots, tx, y + 10 + shots.length * 20 + 150, 10, { color: GRAPHITE }).strokes, { speed: 1000 });
      d.reveal(revealables(section), "-=0.3", 0.05);
      // inspect button (HTML) under the sheet
      const btn = section.querySelector<HTMLElement>(".inspect");
      if (btn) btn.textContent = ui.inspect;
    }, el);
  });
