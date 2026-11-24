export type Artwork = {
  id: string;
  title: string;
  subtitle?: string;
  lines: string[];
  /** Position relative to room centre (x, y, z) and yaw in radians. */
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
  floating?: boolean;
  /** Optional image path under /public (e.g. "/art/project.jpg"). Replaces the typographic artwork. */
  image?: string;
  study: CaseStudy;
};

export type CaseStudy = {
  eyebrow: string;
  title: string;
  meta?: { label: string; value: string }[];
  sections: { heading: string; body?: string; bullets?: string[] }[];
  tags?: string[];
  links?: { label: string; href: string }[];
};

export type Room = {
  id: string;
  index: number;
  name: string;
  accent: string;
  artworks: Artwork[];
};

export const ROOM_W = 16;
export const ROOM_H = 6.5;
export const ROOM_D = 18;
export const GAP = 6;
export const PITCH = ROOM_D + GAP;
export const EYE = 1.7;

export const roomZ = (i: number) => -i * PITCH;

const gh = "https://github.com/itsvineetwork-oss";

export const rooms: Room[] = [
  {
    id: "profile",
    index: 0,
    name: "Profile",
    accent: "#b89a62",
    artworks: [
      {
        id: "portrait",
        title: "Vineet Sharma",
        subtitle: "Software engineer · Enterprise systems",
        lines: ["I build the software that runs the business, end to end.", "Web · Cloud · ERP/CRM"],
        position: [0, 2.4, -ROOM_D / 2 + 0.2],
        rotation: [0, 0, 0],
        size: [5, 3.2],
        study: {
          eyebrow: "Room 01 · Profile",
          title: "Vineet Sharma",
          meta: [
            { label: "Role", value: "Software engineer" },
            { label: "Focus", value: "Full-stack, cloud, ERP/CRM" },
            { label: "Based in", value: "India" },
            { label: "Status", value: "Open to projects" },
          ],
          sections: [
            {
              heading: "About",
              body: "I design and ship software that connects operations, finance and sales in one system. Most of my work sits between the web layer, the database and the enterprise tools a business already depends on.",
            },
            {
              heading: "How I work",
              bullets: ["Clean data models first", "Reliable, boring deployments", "Interfaces people can use without training"],
            },
          ],
          links: [{ label: "GitHub", href: gh }],
        },
      },
      {
        id: "manifesto",
        title: "Manifesto",
        lines: ["Build the thing that removes the spreadsheet.", "Measure before optimising.", "Ship small, ship often."],
        position: [-ROOM_W / 2 + 0.2, 2.2, -2],
        rotation: [0, Math.PI / 2, 0],
        size: [3.6, 2.4],
        study: {
          eyebrow: "Room 01 · Profile",
          title: "Manifesto",
          sections: [
            { heading: "Principles", bullets: ["Build the thing that removes the spreadsheet.", "Measure before optimising.", "Ship small, ship often.", "Write it down so the next person can run it."] },
          ],
        },
      },
      {
        id: "now",
        title: "Now",
        lines: ["Building internal tools for manufacturing.", "Learning: Three.js, infrastructure as code."],
        position: [ROOM_W / 2 - 0.2, 2.2, 1],
        rotation: [0, -Math.PI / 2, 0],
        size: [3.6, 2.4],
        floating: true,
        study: {
          eyebrow: "Room 01 · Profile",
          title: "What I am doing now",
          sections: [
            { heading: "Currently", bullets: ["Building internal tools for a manufacturing business", "Integrating ERP, CRM and reporting", "Learning Three.js and infrastructure as code"] },
          ],
        },
      },
    ],
  },
  {
    id: "skills",
    index: 1,
    name: "Skills",
    accent: "#7f8b96",
    artworks: [
      { id: "frontend", title: "Frontend", lines: ["React · TypeScript", "Next.js", "HTML · CSS · Accessibility"], position: [-5, 2.3, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [3.4, 2.4],
        study: { eyebrow: "Room 02 · Skills", title: "Frontend", sections: [{ heading: "Stack", bullets: ["React, TypeScript, Next.js", "Design systems and accessibility", "Three.js and React Three Fiber"] }], tags: ["React", "TypeScript", "Next.js", "CSS"] } },
      { id: "backend", title: "Backend", lines: ["Node.js · Python", "REST APIs", "PostgreSQL"], position: [0, 2.3, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [3.4, 2.4],
        study: { eyebrow: "Room 02 · Skills", title: "Backend", sections: [{ heading: "Stack", bullets: ["Node.js and Python services", "REST APIs, authentication, background jobs", "PostgreSQL data modelling"] }], tags: ["Node.js", "Python", "PostgreSQL"] } },
      { id: "cloud", title: "Cloud", lines: ["AWS · Docker", "CI/CD · GitHub Actions", "Monitoring"], position: [5, 2.3, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [3.4, 2.4],
        study: { eyebrow: "Room 02 · Skills", title: "Cloud and DevOps", sections: [{ heading: "Stack", bullets: ["AWS, Docker, Linux", "CI/CD with GitHub Actions", "Monitoring and backups"] }], tags: ["AWS", "Docker", "CI/CD"] } },
      { id: "enterprise", title: "Enterprise", lines: ["ERP / CRM integration", "Reporting · Automation", "Data migration"], position: [0, 3.2, 3], rotation: [0.15, Math.PI, 0.08], size: [4.2, 2.6], floating: true,
        study: { eyebrow: "Room 02 · Skills", title: "Enterprise systems", sections: [{ heading: "Work", bullets: ["ERP and CRM integration", "Reporting and automation", "Data migration and clean-up"] }], tags: ["ERP", "CRM", "Automation"] } },
    ],
  },
  {
    id: "projects",
    index: 2,
    name: "Projects",
    accent: "#9a6b4f",
    artworks: [
      { id: "p-website", title: "Company website & tools", subtitle: "2025", lines: ["Public site + internal tools", "for a manufacturing business."], position: [-5.2, 2.4, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [4, 2.8],
        study: { eyebrow: "Room 03 · Projects", title: "Company website and internal tools", meta: [{ label: "Year", value: "2025" }, { label: "Role", value: "Design, build, deploy" }, { label: "Stack", value: "Next.js, PostgreSQL, AWS" }, { label: "Status", value: "Live" }],
          sections: [{ heading: "Problem", body: "Product information lived in PDFs and email threads. Enquiries were handled by hand and documents were retyped for every order." }, { heading: "Solution", body: "A public website with a structured product catalogue, an enquiry pipeline and a document generator that produces quotations and specifications from one source of truth." }, { heading: "Outcome", bullets: ["Enquiry response time cut from days to hours", "One catalogue feeding web, print and quotes", "Deployed with CI on AWS"] }],
          tags: ["Next.js", "PostgreSQL", "AWS", "CI/CD"], links: [{ label: "GitHub", href: gh }] } },
      { id: "p-ciso", title: "Security dashboard", subtitle: "2025", lines: ["Single view of security posture", "for a small IT team."], position: [0, 2.4, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [4, 2.8],
        study: { eyebrow: "Room 03 · Projects", title: "Security posture dashboard", meta: [{ label: "Year", value: "2025" }, { label: "Role", value: "Full-stack" }, { label: "Stack", value: "React, Node.js, Docker" }, { label: "Status", value: "Open source" }],
          sections: [{ heading: "Problem", body: "A small IT team had no single place to see assets, controls and audit evidence." }, { heading: "Solution", body: "A dashboard with asset inventory, control status and audit-ready reports, packaged with Docker for simple deployment." }, { heading: "Outcome", bullets: ["Audit prep from weeks to days", "Clear ownership of each control"] }],
          tags: ["React", "Node.js", "Docker"], links: [{ label: "GitHub", href: `${gh}/ciso` }] } },
      { id: "p-automation", title: "Automation suite", subtitle: "2024", lines: ["Scripts and services that", "replace manual data entry."], position: [5.2, 2.4, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [4, 2.8],
        study: { eyebrow: "Room 03 · Projects", title: "Python automation suite", meta: [{ label: "Year", value: "2024" }, { label: "Role", value: "Engineer" }, { label: "Stack", value: "Python, Pandas" }, { label: "Status", value: "In use" }],
          sections: [{ heading: "Problem", body: "Daily reports were built by copying between spreadsheets and emailing the result." }, { heading: "Solution", body: "Scheduled Python services that import spreadsheets, validate data, build reports and send them automatically." }, { heading: "Outcome", bullets: ["Several hours of manual work removed per week", "Validation catches errors before they reach finance"] }],
          tags: ["Python", "Pandas", "Cron"], links: [{ label: "GitHub", href: gh }] } },
    ],
  },
  {
    id: "lab",
    index: 3,
    name: "Engineering Lab",
    accent: "#4f7a8a",
    artworks: [
      { id: "lab-3d", title: "This gallery", lines: ["Next.js · React Three Fiber", "GSAP camera choreography"], position: [-ROOM_W / 2 + 0.2, 2.6, -3], rotation: [0, Math.PI / 2, 0], size: [4, 2.6],
        study: { eyebrow: "Room 04 · Engineering Lab", title: "The Dimension Gallery", meta: [{ label: "Type", value: "Experiment" }, { label: "Stack", value: "Next.js, R3F, Three.js, GSAP" }],
          sections: [{ heading: "Idea", body: "A portfolio as an architectural walk: six rooms, one corridor, artworks that open into case studies." }, { heading: "Notes", bullets: ["Canvas-rendered artworks, no image assets", "Pointer-lock walking with scroll travel between rooms", "Static export, deployable anywhere"] }],
          tags: ["Three.js", "R3F", "GSAP"], links: [{ label: "Source", href: `${gh}/vineet` }] } },
      { id: "lab-infra", title: "Infra as code", lines: ["Reproducible servers", "Docker · GitHub Actions"], position: [ROOM_W / 2 - 0.2, 2.6, -3], rotation: [0, -Math.PI / 2, 0], size: [4, 2.6],
        study: { eyebrow: "Room 04 · Engineering Lab", title: "Infrastructure as code", sections: [{ heading: "Experiment", body: "Rebuilding a small company's servers from a single repository: containers, backups and monitoring defined in code." }], tags: ["Docker", "Linux", "GitHub Actions"] } },
      { id: "lab-ai", title: "AI tooling", lines: ["Document extraction", "LLM-assisted workflows"], position: [0, 3.4, 4], rotation: [0.2, Math.PI, -0.1], size: [4.4, 2.6], floating: true,
        study: { eyebrow: "Room 04 · Engineering Lab", title: "AI-assisted workflows", sections: [{ heading: "Experiment", body: "Extracting structured data from supplier documents and drafting replies, with a human approving every step." }], tags: ["LLM", "Python"] } },
    ],
  },
  {
    id: "career",
    index: 4,
    name: "Career Journey",
    accent: "#6b6f9a",
    artworks: [
      { id: "c-now", title: "2023 — Present", subtitle: "Software Engineer · Premnath Rail", lines: ["Web presence, internal tooling,", "ERP / CRM / reporting integration."], position: [-5, 2.4, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [4.2, 2.8],
        study: { eyebrow: "Room 05 · Career Journey", title: "Software Engineer", meta: [{ label: "Company", value: "Premnath Rail" }, { label: "Period", value: "2023 — Present" }], sections: [{ heading: "Responsibilities", bullets: ["Own the web presence and internal tooling", "Integrations between ERP, CRM and reporting", "Automation of recurring operations work"] }] } },
      { id: "c-freelance", title: "2021 — 2023", subtitle: "Developer · Freelance", lines: ["Websites, dashboards and automation", "for small businesses across India."], position: [1, 2.4, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [4.2, 2.8],
        study: { eyebrow: "Room 05 · Career Journey", title: "Freelance developer", meta: [{ label: "Period", value: "2021 — 2023" }], sections: [{ heading: "Work", bullets: ["Websites and dashboards", "Automation for small businesses", "Hosting and maintenance"] }] } },
      { id: "c-edu", title: "Education", lines: ["Computer science foundations,", "self-taught systems and cloud."], position: [6.2, 3.1, -4], rotation: [0.1, -0.5, 0], size: [3.2, 2.2], floating: true,
        study: { eyebrow: "Room 05 · Career Journey", title: "Education", sections: [{ heading: "Background", body: "Computer science foundations, then self-taught systems, cloud and enterprise integration through real projects." }] } },
    ],
  },
  {
    id: "contact",
    index: 5,
    name: "Contact",
    accent: "#b89a62",
    artworks: [
      { id: "email", title: "hello@vineetsharma.dev", subtitle: "Email", lines: ["Open to projects and collaborations."], position: [0, 2.5, -ROOM_D / 2 + 0.2], rotation: [0, 0, 0], size: [6, 2.6],
        study: { eyebrow: "Room 06 · Contact", title: "Get in touch", meta: [{ label: "Email", value: "hello@vineetsharma.dev" }, { label: "GitHub", value: "itsvineetwork-oss" }], sections: [{ heading: "Availability", body: "Open to projects and collaborations. The fastest way to reach me is email." }], links: [{ label: "Email", href: "mailto:hello@vineetsharma.dev" }, { label: "GitHub", href: gh }, { label: "LinkedIn", href: "https://www.linkedin.com/in/vineet-sharma" }] } },
      { id: "github", title: "GitHub", lines: ["github.com/itsvineetwork-oss"], position: [-ROOM_W / 2 + 0.2, 2.2, 0], rotation: [0, Math.PI / 2, 0], size: [3.4, 2.2],
        study: { eyebrow: "Room 06 · Contact", title: "GitHub", sections: [{ heading: "Code", body: "Open source work and experiments." }], links: [{ label: "Open GitHub", href: gh }] } },
      { id: "linkedin", title: "LinkedIn", lines: ["linkedin.com/in/vineet-sharma"], position: [ROOM_W / 2 - 0.2, 2.2, 0], rotation: [0, -Math.PI / 2, 0], size: [3.4, 2.2],
        study: { eyebrow: "Room 06 · Contact", title: "LinkedIn", sections: [{ heading: "Profile", body: "Career history and recommendations." }], links: [{ label: "Open LinkedIn", href: "https://www.linkedin.com/in/vineet-sharma" }] } },
    ],
  },
];

export const artworkById = new Map<string, Artwork>();
for (const r of rooms) for (const a of r.artworks) artworkById.set(a.id, a);
