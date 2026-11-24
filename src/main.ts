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
import { analytics } from "./content";
import { C } from "./i18n";
import { probe, url } from "./engine/assets";
import { scratch } from "./engine/sound";
import type { Scene } from "./sections/scene";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

// ---- optional files: find out which exist before the scenes are laid out
{
  const c = C();
  await Promise.all([c.about.photo, c.contact.resume, ...c.projects.flatMap((p) => p.images || [])].map((f) => probe(f)));
}
const hasResume = C().contact.resume ? await probe(C().contact.resume) : false;

// ---- accessible HTML copy (also shown on phones), rendered from the active language
function renderCopy() {
  const { about, projects, experience, skills, education, contact, ui, identity } = C();
  document.querySelector<HTMLElement>('[data-copy="tagline"]')!.textContent = identity.tagline;
  document.querySelector<HTMLElement>('[data-copy="about"]')!.innerHTML =
    `<p class="lead">${esc(about.intro)}</p><h3>${esc(ui.approach)}</h3><ul>${about.approach.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>`;
  projects.forEach((p) => {
    const art = document.getElementById(`p-${p.id}`);
    const box = art?.querySelector<HTMLElement>('[data-copy="project"]');
    if (!box) return;
    const links = (p.links || []).map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join(" ");
    box.innerHTML = `<h3 class="sr-only">${esc(p.name)}</h3><dl class="sr-only"><dt>${esc(ui.problem)}</dt><dd>${esc(p.problem)}</dd><dt>${esc(ui.contribution)}</dt><dd>${esc(p.contribution)}</dd><dt>${esc(ui.stack)}</dt><dd>${esc([...p.stack, ...(p.integrations || [])].join(" · "))}</dd><dt>Features</dt><dd>${esc(p.features.join(". "))}</dd></dl>${links ? `<p class="plinks" data-reveal>${links}</p>` : ""}`;
  });
  document.querySelector<HTMLElement>('[data-copy="experience"]')!.innerHTML = experience.map((j) => `<div class="job"><h3>${esc(j.role)} · ${esc(j.company)}</h3><p class="meta">${esc(j.period)}</p><ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("");
  document.querySelector<HTMLElement>('[data-copy="skills"]')!.innerHTML = skills.map((s) => `<div class="skill"><h3>${esc(s.category)}</h3><p>${esc(s.items.join(", "))}</p></div>`).join("");
  document.querySelector<HTMLElement>('[data-copy="education"]')!.innerHTML = education.map((e) => `<h3>${esc(e.degree)}</h3>${e.institution || e.period ? `<p class="meta">${esc([e.institution, e.period].filter(Boolean).join(" · "))}</p>` : ""}<ul>${e.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`).join("");
  // contact links (only the ones that are filled in)
  const links = $("contact-links");
  links.innerHTML = "";
  const add = (label: string, href: string, value?: string) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${esc(href)}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(label)}</a>${value ? ` <span class="value">${esc(value)}</span>` : ""}`;
    li.setAttribute("data-reveal", "");
    links.appendChild(li);
  };
  if (contact.email) add("Email", `mailto:${contact.email}`, contact.email);
  if (contact.linkedin) add("LinkedIn", contact.linkedin);
  if (contact.github) add("GitHub", contact.github, contact.github.replace("https://", ""));
  if (hasResume) add(ui.resumePdf, url(contact.resume));
  const r = $<HTMLAnchorElement>("resume-link");
  r.href = url(contact.resume); r.hidden = !hasResume; r.textContent = ui.buttons.resume;
  // ui strings
  for (const [k, v] of Object.entries(ui.nav)) document.querySelector<HTMLElement>(`[data-nav="${k}"]`)!.textContent = v;
  for (const [k, v] of Object.entries(ui.headings)) { const h = document.querySelector<HTMLElement>(`[data-ui="h-${k}"]`); if (h) h.textContent = v; }
  const set = (key: string, text: string) => { const el = document.querySelector<HTMLElement>(`[data-ui="${key}"]`); if (el) el.textContent = text; };
  set("explore", ui.explore); set("openTo", ui.openTo); set("footer", ui.footer);
  set("f-name", ui.form.name); set("f-email", ui.form.email); set("f-message", ui.form.message); set("f-send", ui.form.send);
  document.title = `${identity.fullName} — ${identity.title}`;
}
renderCopy();
$("year").textContent = String(new Date().getFullYear());

// ---- motion preference: the OS "reduce motion" setting shows finished drawings immediately
const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- build every scene (strokes are laid out now, drawn by scrolling)
const scenes: Scene[] = [home(), aboutScene(), projectsScene(), ...projectScenes(), experienceScene(), skillsScene(), educationScene(), contactScene()];
const byId = new Map(scenes.map((s) => [s.id, s]));
const index = (s: Scene) => scenes.indexOf(s);
const toast = $("toast");
void toast;

document.body.classList.toggle("no-motion", !motion);
if (!motion) scenes.forEach((s) => s.finish());

// ---- scroll-scrubbed drawing: each page's timeline follows the scroll position through that page.
//      Scroll fast and it draws fast; scroll back up and it un-draws.
const triggers = new Map<Scene, ScrollTrigger>();
if (motion) {
  scenes.forEach((s) => {
    const st = ScrollTrigger.create({
      trigger: s.section,
      start: "top 82%",
      end: "bottom 45%",
      scrub: 0.5,
      animation: s.director.tl,
      onUpdate: (self) => { const d = self.progress >= 0.999; s.done = d; s.section.classList.toggle("is-drawn", d); },
    });
    triggers.set(s, st);
  });
}
scenes.forEach((s) => {
  ScrollTrigger.create({
    trigger: s.section, start: "top 50%", end: "bottom 50%",
    onToggle: (st) => { if (st.isActive) document.querySelectorAll(".topbar nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${s.id.startsWith("p-") ? "projects" : s.id}`)); },
  });
});

// ---- navigation: a cinematic scroll; the pages in between draw on the way
document.querySelectorAll<HTMLAnchorElement>(".topbar nav a, a.cta, a.logo").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href")!.slice(1);
    const s = byId.get(id);
    if (!s) return;
    e.preventDefault();
    history.replaceState(null, "", `#${id}`);
    const dist = Math.abs(s.section.getBoundingClientRect().top);
    gsap.to(window, { scrollTo: { y: s.section, offsetY: 56, autoKill: true }, duration: Math.min(2.2, 0.6 + dist / 2500), ease: "power2.inOut" });
  });
});

// ---- progress line: one segment per menu section, filled when that page (and its sub-pages) is drawn
const sections = ["home", "about", "projects", "experience", "skills", "education", "contact"];
const progress = $("progress");
sections.forEach((id) => { const seg = document.createElement("span"); seg.dataset.for = id; progress.appendChild(seg); });
const belongsTo = (s: Scene) => (s.id.startsWith("p-") ? "projects" : s.id);
function paintProgress() {
  for (const id of sections) {
    const group = scenes.filter((s) => belongsTo(s) === id && !s.hidden);
    const seg = progress.querySelector<HTMLElement>(`[data-for="${id}"]`)!;
    seg.classList.toggle("done", group.length > 0 && group.every((s) => s.done));
    seg.classList.toggle("live", group.some((s) => !s.done && (triggers.get(s)?.progress ?? 0) > 0));
  }
}
paintProgress();
setInterval(paintProgress, 500);

// ---- project filters by stack: hidden projects are skipped by the page order
const filters = $("filters");
let activeFilter = "all";
function renderFilters() {
  const { projects, ui } = C();
  const tags = Array.from(new Set(projects.flatMap((p) => [...p.stack, ...(p.integrations || [])])));
  filters.setAttribute("aria-label", ui.filters.label);
  filters.innerHTML = [ui.filters.all, ...tags].map((t, i) => `<button type="button" data-tag="${i === 0 ? "all" : esc(t)}" aria-pressed="${(i === 0 ? "all" : t) === activeFilter}">${esc(t)}</button>`).join("");
}
function applyFilter(tag: string) {
  activeFilter = tag;
  const { projects } = C();
  for (const p of projects) {
    const show = tag === "all" || [...p.stack, ...(p.integrations || [])].includes(tag);
    const art = document.getElementById(`p-${p.id}`)!;
    art.classList.toggle("hidden", !show);
    const sc = byId.get(`p-${p.id}`)!;
    sc.hidden = !show;
  }
  filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tag === tag)));
  ScrollTrigger.refresh();
  paintProgress();
}
filters.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-tag]"); if (b) applyFilter(b.dataset.tag!); });
renderFilters();

// ---- toolbar
const soundBtn = $<HTMLButtonElement>("sound");
const paintSound = () => { soundBtn.textContent = scratch.enabled ? C().ui.buttons.soundOn : C().ui.buttons.soundOff; soundBtn.setAttribute("aria-pressed", String(scratch.enabled)); };
soundBtn.addEventListener("click", () => { scratch.toggle(); paintSound(); });
paintSound();

// ---- blueprint theme (remembered per browser; follows the OS dark setting the first time)
const themeBtn = $<HTMLButtonElement>("theme");
let blueprint = matchMedia("(prefers-color-scheme: dark)").matches;
try { const saved = localStorage.getItem("theme"); if (saved) blueprint = saved === "blueprint"; } catch {}
function applyTheme() {
  document.documentElement.setAttribute("data-theme", blueprint ? "blueprint" : "paper");
  themeBtn.setAttribute("aria-pressed", String(blueprint));
  themeBtn.textContent = blueprint ? C().ui.buttons.paper : C().ui.buttons.blueprint;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", blueprint ? "#1f3f7a" : "#f4f1ea");
}
applyTheme();
themeBtn.addEventListener("click", () => { blueprint = !blueprint; try { localStorage.setItem("theme", blueprint ? "blueprint" : "paper"); } catch {} applyTheme(); });

// ---- contact form: posts to the configured endpoint, or opens the mail app
const form = $<HTMLFormElement>("cform");
const status = $("cf-status");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { contact, ui } = C();
  const name = $<HTMLInputElement>("cf-name").value.trim();
  const email = $<HTMLInputElement>("cf-email").value.trim();
  const msg = $<HTMLTextAreaElement>("cf-msg").value.trim();
  const setStatus = (t: string, cls = "") => { status.textContent = t; status.className = `status ${cls}`; };
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !msg) { setStatus(ui.form.invalid, "err"); return; }
  const btn = form.querySelector("button")!;
  if (contact.formEndpoint) {
    btn.disabled = true; setStatus(ui.form.sending);
    try {
      const r = await fetch(contact.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name, email, message: msg }) });
      if (!r.ok) throw new Error(String(r.status));
      form.reset(); setStatus(ui.form.sent, "ok");
    } catch { setStatus(ui.form.failed, "err"); }
    btn.disabled = false;
  } else if (contact.email) {
    location.href = `mailto:${contact.email}?subject=${encodeURIComponent("Portfolio message from " + name)}&body=${encodeURIComponent(msg + "\n\n" + name + " <" + email + ">")}`;
    setStatus(ui.form.opening);
  } else setStatus(ui.form.notConnected, "err");
});

// ---- analytics (only when configured in content.ts)
if (analytics.provider && analytics.site) {
  const s = document.createElement("script");
  s.async = true;
  if (analytics.provider === "goatcounter") { s.dataset.goatcounter = `https://${analytics.site}.goatcounter.com/count`; s.src = "https://gc.zgo.at/count.js"; }
  else if (analytics.provider === "plausible") { s.defer = true; s.dataset.domain = analytics.site; s.src = "https://plausible.io/js/script.js"; }
  else if (analytics.provider === "umami" && analytics.host) { s.defer = true; s.dataset.websiteId = analytics.site; s.src = analytics.host; }
  if (s.src) document.head.appendChild(s);
}

// ---- deep link on load
if (location.hash && byId.has(location.hash.slice(1))) {
  const s = byId.get(location.hash.slice(1))!;
  requestAnimationFrame(() => { s.section.scrollIntoView(); ScrollTrigger.refresh(); });
}
void index;
window.addEventListener("resize", () => ScrollTrigger.refresh());
