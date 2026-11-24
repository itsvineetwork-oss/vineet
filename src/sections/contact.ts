import { makeScene, revealables } from "./scene";
import { INK, GRAPHITE, RED, BLUE } from "../engine/sketch";
import { C } from "../i18n";
import { exists } from "../engine/assets";

export const contactScene = () =>
  makeScene("contact", [1200, 560], (sk, d, section) => {
    const { contact, identity, ui } = C();
    const h = sk.text(ui.headings.contact, 70, 110, 64, { color: INK, width: 2.4 }, "scriptc", 3);
    d.write(h.strokes, { speed: 800 });
    d.draw(sk.line(70, 128, 70 + h.width, 124, { color: RED, width: 2, tool: "marker" }, { roughness: 2 }), { speed: 1800 });
    d.write(sk.label(ui.lastPage, 72, 160, 11, { color: GRAPHITE }).strokes, { speed: 900 });

    // envelope
    const ex = 300, ey = 300;
    d.draw([
      ...sk.rect(ex - 150, ey - 90, 300, 180, { color: INK, tool: "ink", width: 1.8 }, { roughness: 1.2 }),
      ...sk.sketchPath(`M ${ex - 150} ${ey - 90} L ${ex} ${ey + 10} L ${ex + 150} ${ey - 90}`, { color: INK, tool: "ink", width: 1.8 }),
      ...sk.sketchPath(`M ${ex - 150} ${ey + 90} L ${ex - 40} ${ey - 20} M ${ex + 150} ${ey + 90} L ${ex + 40} ${ey - 20}`, { color: GRAPHITE, width: 1.2 }),
      ...sk.rect(ex + 80, ey - 70, 46, 46, { color: RED, width: 1.2 }, { fill: "#000", hachureGap: 5 }),
    ], { speed: 1300 });
    d.write(sk.text(ui.sayHello, ex, ey + 150, 30, { color: BLUE, width: 1.5 }, "scripts", 2, "center").strokes, { speed: 900 });

    // contact card on the right, with lines for the real links underneath (HTML)
    const cx = 640, cy = 230;
    d.draw(sk.rect(cx, cy, 460, 200, { color: INK, tool: "ink", width: 1.6 }, { roughness: 1.3 }), { speed: 1600 });
    d.draw(sk.line(cx, cy + 50, cx + 460, cy + 50, { color: GRAPHITE }), { speed: 2000 });
    d.write(sk.label(`${identity.fullName.toUpperCase()}  -  ${identity.title.split("|")[0].trim().toUpperCase()}`, cx + 20, cy + 32, 13, { color: INK }).strokes, { speed: 900 });
    const strip = (u: string) => u.replace(/^(mailto:|https?:\/\/(www\.)?)/, "").replace(/\/$/, "");
    const rows = ([["EMAIL", contact.email, contact.email ? `mailto:${contact.email}` : ""], ["LINKEDIN", strip(contact.linkedin), contact.linkedin], ["GITHUB", strip(contact.github), contact.github]] as [string, string, string][]).filter((r) => r[1]);
    const overlay = section.querySelector<HTMLElement>(".card-links");
    if (overlay) overlay.innerHTML = "";
    rows.forEach(([k, v, href], i) => {
      const y = cy + 90 + i * 40;
      d.write(sk.label(k, cx + 20, y, 11, { color: GRAPHITE }).strokes, { speed: 900 });
      d.draw(sk.line(cx + 110, y + 4, cx + 430, y + 4, { color: GRAPHITE, width: 0.8 }, { roughness: 0.6 }), { speed: 2000, noPencil: true });
      d.write(sk.label(v, cx + 118, y, 12, { color: INK }).strokes, { speed: 1200 });
      // clickable, copyable overlay on top of the drawn row (positioned in % of the SVG box)
      if (overlay) {
        const a = document.createElement("a");
        a.href = href; a.className = "row"; a.title = k === "EMAIL" ? "Copy email" : `Open ${v}`;
        if (href.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; }
        a.style.left = `${((cx + 110) / 1200) * 100}%`; a.style.top = `${((y - 16) / 560) * 100}%`;
        a.style.width = `${(330 / 1200) * 100}%`; a.style.height = `${(30 / 560) * 100}%`;
        a.setAttribute("aria-label", `${k}: ${v}`);
        a.dataset.copy = v;
        overlay.appendChild(a);
      }
    });
    if (exists(contact.resume)) {
      // a small document with folded corner, labelled RESUME
      const rx = 1000, ry = 236;
      d.draw([
        ...sk.sketchPath(`M ${rx} ${ry} L ${rx + 64} ${ry} L ${rx + 90} ${ry + 26} L ${rx + 90} ${ry + 118} L ${rx} ${ry + 118} Z`, { color: INK, tool: "ink", width: 1.6 }, { roughness: 0.9 }),
        ...sk.sketchPath(`M ${rx + 64} ${ry} L ${rx + 64} ${ry + 26} L ${rx + 90} ${ry + 26}`, { color: INK, tool: "ink", width: 1.4 }),
        ...sk.line(rx + 14, ry + 50, rx + 76, ry + 50, { color: GRAPHITE }),
        ...sk.line(rx + 14, ry + 68, rx + 76, ry + 68, { color: GRAPHITE }),
        ...sk.line(rx + 14, ry + 86, rx + 56, ry + 86, { color: GRAPHITE }),
      ], { speed: 1400 });
      d.write(sk.label(ui.resumePdf, rx + 45, ry + 140, 10, { color: GRAPHITE }, "center").strokes, { speed: 1000 });
    }
    d.write(sk.paragraph(ui.openTo, cx, cy + 236, 15, 460, { color: INK }).strokes, { speed: 1700, gap: 0.003 });
    d.reveal(revealables(section), "-=0.4");
    d.reveal(section.querySelectorAll(".cform"), "<");
    // a final signature
    d.write(sk.text(ui.signature, 1100, 540, 32, { color: INK, width: 1.6 }, "scriptc", 2, "right").strokes, { speed: 800 });
  });
