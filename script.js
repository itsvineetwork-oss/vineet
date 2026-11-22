(function () {
  const d = window.PORTFOLIO || {};
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const skills = document.getElementById("skills");
  (d.skills || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    skills.appendChild(li);
  });

  const grid = document.getElementById("projects-grid");
  (d.projects || []).forEach((p) => {
    const links = [
      p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">Code</a>` : "",
      p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Live</a>` : ""
    ].filter(Boolean).join("");
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <ul class="tags">${(p.tags || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="card-links">${links}</div>`;
    grid.appendChild(card);
  });

  const timeline = document.getElementById("timeline");
  (d.experience || []).forEach((e) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="period">${esc(e.period)}</div>
      <div>
        <h3>${esc(e.role)} <span class="company">· ${esc(e.company)}</span></h3>
        <p>${esc(e.summary)}</p>
      </div>`;
    timeline.appendChild(li);
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  try {
    const saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (_) {}
  toggle.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (_) {}
  });
})();
