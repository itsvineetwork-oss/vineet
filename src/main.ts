import "./styles.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { home } from "./sections/home";
import { aboutScene } from "./sections/about";
import { projectsScene, projectScenes } from "./sections/projects";
import { experienceScene } from "./sections/experience";
import { skillsScene } from "./sections/skills";
import { educationScene } from "./sections/education";
import { contactScene } from "./sections/contact";
import { contact } from "./content";
import { scratch } from "./engine/sound";
import type { Scene } from "./sections/scene";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ---- contact links (only the ones that are filled in)
const links = document.getElementById("contact-links")!;
const add = (label: string, href: string, value?: string) => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${label}</a>${value ? ` <span class="value">${value}</span>` : ""}`;
  li.setAttribute("data-reveal", "");
  links.appendChild(li);
};
if (contact.email) add("Email", `mailto:${contact.email}`, contact.email);
if (contact.linkedin) add("LinkedIn", contact.linkedin);
if (contact.github) add("GitHub", contact.github, contact.github.replace("https://", ""));
if (contact.resume) add("Resume (PDF)", contact.resume);
document.getElementById("year")!.textContent = String(new Date().getFullYear());

// ---- motion preference (OS setting, or the toolbar toggle, remembered per browser)
const motionBtn = document.getElementById("motion") as HTMLButtonElement;
let motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
try { const saved = localStorage.getItem("motion"); if (saved) motion = saved === "on"; } catch {}

// ---- build every scene (strokes are laid out now, drawn later)
const scenes: Scene[] = [home(), aboutScene(), projectsScene(), ...projectScenes(), experienceScene(), skillsScene(), educationScene(), contactScene()];
const byId = new Map(scenes.map((s) => [s.id, s]));
const played = new Set<string>();
let current: Scene = scenes[0];

function applyMotion() {
  document.body.classList.toggle("no-motion", !motion);
  motionBtn.textContent = `Motion: ${motion ? "on" : "off"}`;
  motionBtn.setAttribute("aria-pressed", String(!motion));
  if (!motion) scenes.forEach((s) => s.finish());
}
applyMotion();

// ---- one page at a time: a section may only draw once every section before it is drawn,
//      and the visitor cannot scroll past a page that is still being drawn (Finish skips ahead).
const index = (s: Scene) => scenes.indexOf(s);
const previousDone = (s: Scene) => scenes.slice(0, index(s)).every((x) => x.done);
const pending = new Set<Scene>();
const inView = (s: Scene) => { const r = s.section.getBoundingClientRect(); return r.top < innerHeight * 0.72 && r.bottom > 0; };
const toast = document.getElementById("toast")!;
let toastTimer = 0;
const say = (msg: string) => { toast.textContent = msg; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800); };

function start(s: Scene) {
  if (!motion) return;
  if (!previousDone(s)) { pending.add(s); return; }
  pending.delete(s);
  if (s.erased) s.rebuild();
  played.add(s.id);
  s.director.play();
}
scenes.forEach((s) => {
  s.onDone = () => { for (const p of [...pending]) if (previousDone(p) && inView(p)) start(p); };
});

/** The page the visitor is held on: the first section that has started but not finished. */
const gate = () => scenes.find((s) => played.has(s.id) && !s.done && !s.erased);
let clamping = false;
const clampScroll = () => {
  if (!motion || clamping) return;
  const g = gate();
  if (!g) return;
  const r = g.section.getBoundingClientRect();
  const bottom = r.bottom + scrollY;
  const top = r.top + scrollY;
  const limit = Math.max(top - 56, bottom - innerHeight + 8);
  if (scrollY > limit) { clamping = true; window.scrollTo(0, limit); clamping = false; }
};
window.addEventListener("scroll", clampScroll, { passive: true });
window.addEventListener("wheel", (e) => {
  if (!motion || e.deltaY <= 0) return;
  const g = gate();
  if (!g) return;
  const r = g.section.getBoundingClientRect();
  const limit = Math.max(r.top + scrollY - 56, r.bottom + scrollY - innerHeight + 8);
  if (scrollY >= limit - 1) { e.preventDefault(); say("This page is still being drawn. Wait, or press Finish."); }
}, { passive: false });

// ---- scroll-linked playback: a section draws itself when it enters the viewport (in order)
scenes.forEach((s) => {
  ScrollTrigger.create({
    trigger: s.section,
    start: "top 72%",
    onEnter: () => { current = s; if (motion && (!played.has(s.id) || s.erased)) start(s); },
    onEnterBack: () => { current = s; if (motion && s.erased) start(s); },
  });
  ScrollTrigger.create({
    trigger: s.section, start: "top 50%", end: "bottom 50%",
    onToggle: (st) => { if (st.isActive) document.querySelectorAll(".topbar nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${s.id}`)); },
  });
});

// ---- navigation: scroll there, then redraw that section from a blank page
document.querySelectorAll<HTMLAnchorElement>('.topbar nav a, a.cta, a.logo').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href")!.slice(1);
    const s = byId.get(id);
    if (!s) return;
    e.preventDefault();
    // moving forward is only allowed once every page before the target is drawn
    const g = gate();
    if (motion && g && index(s) > index(g)) { say("Finish this page first (or press Finish)."); return; }
    if (motion && index(s) > 0 && !previousDone(s)) {
      // mark the skipped pages as complete so the order stays consistent
      scenes.slice(0, index(s)).forEach((x) => { if (!x.done) { x.finish(); played.add(x.id); } });
    }
    history.replaceState(null, "", `#${id}`);
    const go = () => {
      current = s;
      if (!motion) return;
      if (s.done && !s.erased) return; // already drawn: just arrive there
      s.rebuild();
      played.add(s.id);
      s.director.play();
    };
    if (motion) {
      const wait = current !== s ? current.erase() : 0;
      gsap.to(window, { scrollTo: { y: s.section, offsetY: 56, autoKill: false }, duration: 0.9, delay: wait * 0.6, ease: "power2.inOut", onComplete: go });
    } else { s.section.scrollIntoView(); go(); }
  });
});

// ---- toolbar
document.getElementById("finish")!.addEventListener("click", () => { const s = gate() ?? current; played.add(s.id); s.finish(); });
motionBtn.addEventListener("click", () => {
  motion = !motion;
  try { localStorage.setItem("motion", motion ? "on" : "off"); } catch {}
  applyMotion();
  if (motion) {
    played.clear();
    pending.clear();
    scenes.forEach((s) => { s.rebuild(); if (index(s) < index(current)) { s.finish(); played.add(s.id); } });
    ScrollTrigger.refresh();
    start(current);
  }
});
const soundBtn = document.getElementById("sound") as HTMLButtonElement;
soundBtn.addEventListener("click", () => { const on = scratch.toggle(); soundBtn.textContent = `Sound: ${on ? "on" : "off"}`; soundBtn.setAttribute("aria-pressed", String(on)); });

// ---- deep link on load
if (location.hash && byId.has(location.hash.slice(1))) {
  const s = byId.get(location.hash.slice(1))!;
  // pages before a deep-linked one count as drawn, so the gate lets the visitor land there
  scenes.slice(0, index(s)).forEach((x) => { x.finish(); played.add(x.id); });
  requestAnimationFrame(() => { s.section.scrollIntoView(); current = s; });
}
window.addEventListener("resize", () => ScrollTrigger.refresh());
