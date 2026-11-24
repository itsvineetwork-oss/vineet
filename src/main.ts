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

// ---- scroll-linked playback: a section draws itself when it enters the viewport
scenes.forEach((s) => {
  ScrollTrigger.create({
    trigger: s.section,
    start: "top 72%",
    onEnter: () => { current = s; if (motion && (!played.has(s.id) || s.erased)) { if (s.erased) s.rebuild(); played.add(s.id); s.director.play(); } },
    onEnterBack: () => { current = s; if (motion && s.erased) { s.rebuild(); s.director.play(); } },
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
    history.replaceState(null, "", `#${id}`);
    const go = () => {
      current = s;
      if (!motion) return;
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
document.getElementById("finish")!.addEventListener("click", () => { played.add(current.id); current.finish(); });
motionBtn.addEventListener("click", () => {
  motion = !motion;
  try { localStorage.setItem("motion", motion ? "on" : "off"); } catch {}
  applyMotion();
  if (motion) { scenes.forEach((s) => { s.rebuild(); }); played.clear(); ScrollTrigger.refresh(); current.rebuild(); played.add(current.id); current.director.play(); }
});
const soundBtn = document.getElementById("sound") as HTMLButtonElement;
soundBtn.addEventListener("click", () => { const on = scratch.toggle(); soundBtn.textContent = `Sound: ${on ? "on" : "off"}`; soundBtn.setAttribute("aria-pressed", String(on)); });

// ---- deep link on load
if (location.hash && byId.has(location.hash.slice(1))) {
  const s = byId.get(location.hash.slice(1))!;
  requestAnimationFrame(() => { s.section.scrollIntoView(); current = s; });
}
window.addEventListener("resize", () => ScrollTrigger.refresh());
