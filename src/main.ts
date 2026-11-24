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
import { probe, url, exists } from "./engine/assets";
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
  set("s-status", ui.strip.status); set("s-statusValue", ui.strip.statusValue); set("s-location", ui.strip.location); set("s-focus", ui.strip.focus); set("s-focusValue", ui.strip.focusValue);
  document.querySelector<HTMLElement>('[data-copy="location"]')!.textContent = identity.location.toUpperCase();
  document.querySelectorAll<HTMLElement>(".inspect").forEach((b) => (b.textContent = ui.inspect));
  set("f-name", ui.form.name); set("f-email", ui.form.email); set("f-message", ui.form.message); set("f-send", ui.form.send);
  document.title = `${identity.fullName} — ${identity.title}`;
}
renderCopy();
// ---- title block: revision, date, live IST clock
$("tb-rev").textContent = __REVISION__;
$("tb-date").textContent = __BUILD_DATE__;
{
  const clock = $("tb-clock");
  const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const tickClock = () => { clock.textContent = fmt.format(new Date()); };
  tickClock(); setInterval(tickClock, 1000);
}

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
  const LINE = 0.96; // a page draws while it travels from the bottom edge of the screen up to this line
  scenes.forEach((s, i) => {
    // the first sheet draws itself when the site opens; everything after it is driven by scrolling
    if (s.id === "home") { s.director.tl.timeScale(1.6).play(0); return; }
    // the Projects heading ends where the first project page begins; every other page ends at its own bottom
    const endEl = s.id === "projects" ? scenes[i + 1].section : s.section;
    const st = ScrollTrigger.create({
      trigger: s.section,
      // a page is complete before the next page crosses the same line, so pages never draw at the same time;
      // near the end of the document the range is clamped so the last page can still finish
      start: () => {
        const top = s.section.getBoundingClientRect().top + scrollY - innerHeight * LINE;
        const end = endEnd();
        return Math.max(0, Math.min(top, end - 200));
      },
      end: () => endEnd(),
      scrub: 0.25,
      animation: s.director.tl,
      onUpdate: (self) => { const d = self.progress >= 0.999; s.done = d; s.section.classList.toggle("is-drawn", d); },
    });
    triggers.set(s, st);
    function endEnd() {
      const r = endEl.getBoundingClientRect();
      const px = (s.id === "projects" ? r.top : r.bottom) + scrollY - innerHeight * LINE;
      return Math.min(px, ScrollTrigger.maxScroll(window));
    }
  });
}
// ---- scroll spy: the menu section that contains the middle of the screen is the active one
const bar = document.querySelector<HTMLElement>(".topbar")!;
const barHeight = () => bar.offsetHeight;
document.documentElement.style.setProperty("--bar", `${barHeight()}px`);
let activeId = "";
function spy() {
  const mid = barHeight() + (innerHeight - barHeight()) * 0.45;
  let id = activeId;
  for (const el of document.querySelectorAll<HTMLElement>("main > .page")) {
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) { id = el.id; break; }
  }
  if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) id = "contact";
  if (id !== activeId) { activeId = id; document.querySelectorAll(".topbar nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`)); paintProgress(); }
}
window.addEventListener("scroll", spy, { passive: true });
window.addEventListener("resize", () => { document.documentElement.style.setProperty("--bar", `${barHeight()}px`); spy(); });

// ---- navigation: a cinematic scroll; the pages in between draw on the way
document.querySelectorAll<HTMLAnchorElement>(".topbar nav a, a.cta, a.logo").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href")!.slice(1);
    const s = byId.get(id);
    if (!s) return;
    e.preventDefault();
    history.replaceState(null, "", `#${id}`);
    const dist = Math.abs(s.section.getBoundingClientRect().top);
    gsap.to(window, { scrollTo: { y: s.section, offsetY: barHeight() - 2, autoKill: true }, duration: Math.min(2.2, 0.6 + dist / 2500), ease: "power2.inOut" });
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
    seg.classList.toggle("live", id === activeId && !group.every((s) => s.done));
  }
}
paintProgress();
setInterval(paintProgress, 500);
spy();

// ---- contact card: click the email row to copy it (a red stamp confirms); other rows open their link
const stamp = $("copied-stamp");
document.querySelector(".card-links")?.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a.row");
  if (!a || !a.href.startsWith("mailto:")) return;
  e.preventDefault();
  const v = a.dataset.copy || "";
  const done = () => { stamp.textContent = C().ui.copied; stamp.classList.add("show"); setTimeout(() => stamp.classList.remove("show"), 1400); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(v).then(done, () => { location.href = a.href; });
  else location.href = a.href;
});

// ---- hero: a stamp-style CV button when the file exists
{
  const cv = $<HTMLAnchorElement>("cv-stamp");
  const cvs = $<HTMLAnchorElement>("cv-strip");
  if (hasResume) { cv.href = url(C().contact.resume); cv.hidden = false; cvs.href = cv.href; cvs.hidden = false; }
}

// ---- hover spec cards on diagram nodes
const tip = $("tip");
document.addEventListener("pointerover", (e) => {
  const h = (e.target as Element).closest<SVGRectElement>(".hotspot");
  if (!h) return;
  tip.querySelector("b")!.textContent = h.dataset.title || "";
  tip.querySelector("span")!.textContent = h.dataset.note || "";
  tip.hidden = false;
  scratch.tick();
});
document.addEventListener("pointermove", (e) => {
  if (tip.hidden) return;
  const w = tip.offsetWidth, hgt = tip.offsetHeight;
  tip.style.left = `${Math.min(innerWidth - w - 12, e.clientX + 16)}px`;
  tip.style.top = `${e.clientY + 18 + hgt > innerHeight ? e.clientY - hgt - 12 : e.clientY + 18}px`;
});
document.addEventListener("pointerout", (e) => { if ((e.target as Element).closest?.(".hotspot")) tip.hidden = true; });

// ---- case-study sheet
const drawer = $("drawer");
function openCase(id: string) {
  const { projects, ui } = C();
  const p = projects.find((x) => x.id === id);
  if (!p) return;
  drawer.querySelector("h3")!.textContent = p.name;
  const shots = (p.images || []).filter((f) => exists(f));
  const body = drawer.querySelector(".sheet-body")!;
  body.innerHTML = `
    <h4>${esc(ui.problem)}</h4><p>${esc(p.problem)}</p>
    <h4>${esc(ui.contribution)}</h4><p>${esc(p.contribution)}</p>
    ${p.outcome ? `<h4>${esc(ui.outcome)}</h4><p>${esc(p.outcome)}</p>` : ""}
    <h4>${esc(ui.features)}</h4><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
    ${p.tradeoffs?.length ? `<h4>${esc(ui.tradeoffs)}</h4><ul>${p.tradeoffs.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
    <h4>${esc(ui.stack)}</h4><div class="tags">${[...p.stack, ...(p.integrations || [])].map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    ${shots.length ? `<h4>${esc(ui.screenshots)}</h4><div class="shots">${shots.map((f) => `<img src="${esc(url(f))}" alt="${esc(p.name)} screenshot" loading="lazy">`).join("")}</div>` : ""}
    ${p.links?.length ? `<h4>LINKS</h4><p>${p.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join(" · ")}</p>` : ""}`;
  drawer.hidden = false;
  document.body.style.overflow = "hidden";
  (drawer.querySelector(".close") as HTMLElement).focus();
}
function closeCase() { drawer.hidden = true; document.body.style.overflow = ""; }
document.querySelectorAll<HTMLButtonElement>(".inspect").forEach((b) => b.addEventListener("click", () => openCase(b.dataset.project!)));
drawer.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("[data-close]")) closeCase(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) closeCase(); });

// ---- hero wireframe tilts with the mouse (desktop only)
if (matchMedia("(pointer: fine)").matches) {
  const iso = document.querySelector<SVGGElement>("#home .iso");
  const sheet = document.querySelector<HTMLElement>("#home svg.stage");
  if (iso && sheet) {
    sheet.addEventListener("pointermove", (e) => {
      const r = sheet.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(iso, { x: dx * 14, y: dy * 10, skewX: dx * 3, skewY: dy * 2, duration: 0.6, ease: "power2.out" });
    });
    sheet.addEventListener("pointerleave", () => gsap.to(iso, { x: 0, y: 0, skewX: 0, skewY: 0, duration: 0.8, ease: "power2.out" }));
  }
}

// ---- soft paper tick on hovering interactive things (only when sound is on)
document.addEventListener("pointerover", (e) => { if ((e.target as Element).closest?.("a, button, .filters button")) scratch.tick(); });

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
      const st = $("dispatched-stamp"); st.textContent = ui.dispatched; st.classList.add("show"); setTimeout(() => st.classList.remove("show"), 1600);
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

// ---- role-based views: reorder the sheets for who is reading (nothing is hidden)
type View = "default" | "recruiter" | "founder" | "developer";
const ORDER: Record<View, string[]> = {
  default: ["home", "about", "projects", "experience", "skills", "education", "contact"],
  recruiter: ["home", "experience", "education", "about", "skills", "projects", "contact"],
  founder: ["home", "projects", "about", "experience", "skills", "education", "contact"],
  developer: ["home", "projects", "skills", "about", "experience", "education", "contact"],
};
let view: View = "default";
try { const v = localStorage.getItem("view") as View | null; if (v && ORDER[v]) view = v; } catch {}
const main = document.querySelector("main")!;
const navEl = document.querySelector(".topbar nav")!;
function applyView(v: View, scrollTop = false) {
  view = v;
  document.body.dataset.view = v;
  // reorder sections, menu links and progress segments
  for (const id of ORDER[v]) {
    const sec = document.getElementById(id); if (sec) main.appendChild(sec);
    const a = navEl.querySelector(`[data-nav="${id}"]`); if (a) navEl.appendChild(a);
    const seg = progress.querySelector(`[data-for="${id}"]`); if (seg) progress.appendChild(seg);
  }
  sections.length = 0; sections.push(...ORDER[v]);
  // scene order follows the DOM order so drawing stays strictly sequential
  scenes.sort((a, b) => (a.section.compareDocumentPosition(b.section) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  document.querySelectorAll<HTMLButtonElement>(".viewas button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
  let note = document.querySelector<HTMLElement>(".view-note");
  if (!note) { note = document.createElement("p"); note.className = "view-note"; document.getElementById("home")!.appendChild(note); }
  note.textContent = v === "default" ? "" : C().ui.views[v];
  try { localStorage.setItem("view", v); } catch {}
  ScrollTrigger.refresh();
  if (scrollTop) window.scrollTo({ top: 0 });
  spy(); paintProgress();
}
document.querySelectorAll<HTMLButtonElement>(".viewas button").forEach((b) => b.addEventListener("click", () => applyView(b.dataset.view as View, true)));
if (view !== "default") applyView(view);

// ---- command palette (Ctrl/Cmd + K)
type Cmd = { label: string; hint: string; run: () => void; keywords?: string };
const palette = $("palette"), pInput = $<HTMLInputElement>("palette-input"), pList = $("palette-list");
let pItems: Cmd[] = [], pSel = 0;
const navTo = (id: string) => { palette.hidden = true; document.body.style.overflow = ""; document.querySelector<HTMLAnchorElement>(`.topbar nav a[href="#${id}"]`)?.click(); };
function commands(): Cmd[] {
  const { ui, contact } = C();
  const list: Cmd[] = sections.map((id) => ({ label: `Go to ${ui.nav[id as keyof typeof ui.nav]}`, hint: "Section", run: () => navTo(id), keywords: id }));
  list.push({ label: blueprint ? "Switch to Paper" : "Switch to Blueprint", hint: "Theme", run: () => themeBtn.click(), keywords: "theme dark light mode" });
  list.push({ label: scratch.enabled ? "Sound off" : "Sound on", hint: "Audio", run: () => soundBtn.click(), keywords: "audio mute" });
  list.push({ label: "Toggle inspect mode", hint: "I", run: () => setInspect(!inspecting), keywords: "x-ray dimensions debug" });
  if (contact.email) list.push({ label: "Copy email", hint: "Clipboard", run: () => { navigator.clipboard?.writeText(contact.email); stamp.textContent = C().ui.copied; stamp.classList.add("show"); setTimeout(() => stamp.classList.remove("show"), 1400); navTo("contact"); }, keywords: "mail contact" });
  if (hasResume) list.push({ label: "Download resume (PDF)", hint: "File", run: () => window.open(url(contact.resume), "_blank", "noopener"), keywords: "cv" });
  if (contact.github) list.push({ label: "View GitHub", hint: "Link", run: () => window.open(contact.github, "_blank", "noopener"), keywords: "code repos" });
  if (contact.linkedin) list.push({ label: "View LinkedIn", hint: "Link", run: () => window.open(contact.linkedin, "_blank", "noopener") });
  C().projects.forEach((p) => list.push({ label: `Open case study: ${p.name}`, hint: "Project", run: () => { palette.hidden = true; document.body.style.overflow = ""; openCase(p.id); }, keywords: p.stack.join(" ") }));
  (["default", "recruiter", "founder", "developer"] as View[]).forEach((v) => list.push({ label: `View as ${v === "default" ? "everyone" : v}`, hint: "View", run: () => applyView(v, true), keywords: "role mode" }));
  return list;
}
function renderPalette() {
  const q = pInput.value.trim().toLowerCase();
  pItems = commands().filter((c) => !q || (c.label + " " + (c.keywords || "")).toLowerCase().includes(q));
  pSel = Math.min(pSel, Math.max(0, pItems.length - 1));
  pList.innerHTML = pItems.map((c, i) => `<li role="option" aria-selected="${i === pSel}" data-i="${i}">${esc(c.label)}<small>${esc(c.hint)}</small></li>`).join("") || `<li><small>No matching command</small></li>`;
}
function openPalette() { palette.hidden = false; document.body.style.overflow = "hidden"; pInput.value = ""; pSel = 0; renderPalette(); pInput.focus(); }
function closePalette() { palette.hidden = true; document.body.style.overflow = ""; }
pInput.addEventListener("input", () => { pSel = 0; renderPalette(); });
pInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { pSel = Math.min(pItems.length - 1, pSel + 1); renderPalette(); e.preventDefault(); }
  else if (e.key === "ArrowUp") { pSel = Math.max(0, pSel - 1); renderPalette(); e.preventDefault(); }
  else if (e.key === "Enter") { pItems[pSel]?.run(); if (!palette.hidden && pItems[pSel]) closePalette(); }
});
pList.addEventListener("click", (e) => { const li = (e.target as HTMLElement).closest<HTMLElement>("li[data-i]"); if (li) { pItems[Number(li.dataset.i)]?.run(); if (!palette.hidden) closePalette(); } });
palette.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("[data-close]")) closePalette(); });

// ---- inspect mode (I): CAD dimension lines and live metadata over every sheet
const inspectLayer = $("inspect");
let inspecting = false;
let hud: HTMLElement | null = null;
let fpsFrames = 0, fpsLast = performance.now(), fps = 0;
function paintInspect() {
  if (!inspecting) return;
  const docH = document.documentElement.scrollHeight;
  inspectLayer.style.height = `${docH}px`;
  const blocks = Array.from(document.querySelectorAll<HTMLElement>("main > .page, .project"));
  inspectLayer.innerHTML = blocks.map((el) => {
    const r = el.getBoundingClientRect();
    const paths = el.querySelectorAll(":scope > svg path.sk, :scope > .stage-wrap svg path.sk").length;
    const drawn = el.classList.contains("is-drawn") ? "DRAWN" : "IN PROGRESS";
    return `<div class="box" style="left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;height:${r.height}px">
      <i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>
      <div class="dim"><span>${Math.round(r.width)} px</span></div>
      <div class="vdim"><span>${Math.round(r.height)} px</span></div>
      <div class="meta">#${el.id}<br>SVG PATHS: ${paths}<br>${drawn}</div>
    </div>`;
  }).join("");
}
function paintHud() {
  if (!hud) return;
  const dpr = devicePixelRatio.toFixed(2);
  hud.innerHTML = `VIEWPORT ${innerWidth} × ${innerHeight} @${dpr}x<br>SCROLL ${Math.round(scrollY)} / ${document.documentElement.scrollHeight - innerHeight}<br>FPS ${fps}<br>SVG PATHS ${document.querySelectorAll("path.sk").length}<br>REV ${__REVISION__}`;
}
function setInspect(on: boolean) {
  inspecting = on;
  document.body.classList.toggle("inspecting", on);
  inspectLayer.hidden = !on;
  if (on && !hud) { hud = document.createElement("div"); hud.className = "inspect-hud"; document.body.appendChild(hud); }
  if (!on && hud) { hud.remove(); hud = null; }
  paintInspect(); paintHud();
}
(function fpsLoop() { fpsFrames++; const now = performance.now(); if (now - fpsLast >= 1000) { fps = fpsFrames; fpsFrames = 0; fpsLast = now; if (inspecting) paintHud(); } requestAnimationFrame(fpsLoop); })();
window.addEventListener("scroll", () => { if (inspecting) { paintInspect(); paintHud(); } }, { passive: true });
window.addEventListener("resize", () => { if (inspecting) { paintInspect(); paintHud(); } });

// ---- keyboard: Ctrl/Cmd+K palette, I inspect, Esc closes
window.addEventListener("keydown", (e) => {
  const typing = (e.target as HTMLElement).matches?.("input, textarea") && e.target !== pInput;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette.hidden ? openPalette() : closePalette(); return; }
  if (typing || e.target === pInput) { if (e.key === "Escape" && e.target === pInput) closePalette(); return; }
  if (e.key.toLowerCase() === "i" && !e.ctrlKey && !e.metaKey && !e.altKey) { setInspect(!inspecting); }
  if (e.key === "Escape") { if (!palette.hidden) closePalette(); else if (inspecting) setInspect(false); }
});

// ---- deep link on load
if (location.hash && byId.has(location.hash.slice(1))) {
  const s = byId.get(location.hash.slice(1))!;
  requestAnimationFrame(() => { s.section.scrollIntoView(); ScrollTrigger.refresh(); });
}
void index;
window.addEventListener("resize", () => ScrollTrigger.refresh());
