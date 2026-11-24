/**
 * All portfolio content lives here. Edit freely.
 * Fields marked TODO are not yet verified: fill them in or leave blank (blank fields are not rendered).
 */

export const identity = {
  name: "VINEET",
  fullName: "Vineet Sharma",
  title: "Software Developer | Python Programmer",
  tagline: "Building software, automation systems, and practical engineering solutions.",
  location: "India",
};

export const about = {
  /** Optional photo under /public (3:4). Used only when no traced portrait exists in src/data/portrait.json; otherwise a monogram. */
  photo: "",
  intro:
    "I am a software developer and Python programmer. I build ERP systems, engineering calculators and automation tools that people use every day at work.",
  approach: [
    "Understand the real workflow before writing code.",
    "Prefer simple, well-structured systems over clever ones.",
    "Automate the repetitive, document the rest.",
  ],
  annotations: ["Python first", "APIs & databases", "automation", "practical engineering"],
};

export type Project = {
  id: string;
  name: string;
  problem: string;
  contribution: string;
  stack: string[];
  integrations?: string[];
  features: string[];
  /** Measurable result, e.g. "Replaced 15 spreadsheets with one system". Shown only when filled. */
  outcome?: string;
  /** Engineering decisions and trade-offs for the case-study sheet. Shown only when filled. */
  tradeoffs?: string[];
  /** What each diagram node did, shown as a floating spec card on hover. Keys are the node labels. */
  nodes?: Record<string, string>;
  /** Public demo or walkthrough; shown as a LIVE DEMO button when filled. */
  demo?: string;
  /** Source repository; shown as a SOURCE CODE button when filled. */
  source?: string;
  /** Optional screenshots under /public, e.g. "/shots/erp-1.png". Revealed with a sketch-to-image effect. */
  images?: string[];
  links?: { label: string; href: string }[];
  diagram?: "erp" | "calculator" | "automation";
};

export const projects: Project[] = [
  {
    id: "erp",
    name: "PremnathRail ERP",
    problem: "Day-to-day operations ran across spreadsheets, documents and email, with no single system of record.",
    contribution: "Design and development of the ERP: data model, API, backend services and the web frontend.",
    stack: ["Next.js", "React", "TypeScript", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker"],
    integrations: ["Microsoft Entra ID", "SharePoint"], // TODO verify which integrations are live
    features: ["Frontend → API → backend services → PostgreSQL", "Role-based access with Microsoft Entra ID sign-in", "Document flows connected to SharePoint", "Deployed with Docker on a VPS"],
    outcome: "", // TODO e.g. "Replaced N spreadsheets; quotations now take minutes instead of days"
    tradeoffs: [], // TODO e.g. "FastAPI + SQLAlchemy over Django: thinner API layer, explicit schemas"
    nodes: {
      "FRONTEND": "Next.js / React app: forms, tables and dashboards for daily operations.",
      "API": "FastAPI layer with typed request and response schemas.",
      "BACKEND SERVICES": "Business rules, SQLAlchemy models and scheduled jobs.",
      "PostgreSQL": "System of record: one schema for operations, documents and users.",
      "ENTRA ID": "Sign-in with Microsoft Entra ID; roles mapped to ERP permissions.",
      "SHAREPOINT": "Documents read from and written back to SharePoint libraries.",
    },
    demo: "",   // TODO public demo or video walkthrough URL, if any (the ERP is internal)
    source: "", // TODO repository URL if public
    images: ["/shots/erp-1.png", "/shots/erp-2.png"], // add the files under public/shots; missing files are skipped
    links: [],  // TODO add live / GitHub links if public
    diagram: "erp",
  },
  {
    id: "calculators",
    name: "Python Engineering Calculators",
    problem: "Engineering calculations were repeated by hand, with inconsistent inputs and no record of results.",
    contribution: "Python tools that take validated inputs, run the calculation and produce a clear, repeatable output.",
    stack: ["Python"],
    features: ["Validated inputs", "Repeatable, documented results", "Command-line and script friendly"],
    nodes: { "INPUTS": "Engineering inputs with units.", "VALIDATE": "Range and unit checks before any calculation.", "CALCULATE": "The calculation itself, kept pure and testable.", "REPORT": "A clear, repeatable output that can be filed." },
    source: "https://github.com/itsvineetwork-oss",
    images: ["/shots/calculators-1.png"],
    links: [{ label: "GitHub", href: "https://github.com/itsvineetwork-oss" }],
    diagram: "calculator",
  },
  {
    id: "automation",
    name: "Automation Projects",
    problem: "Recurring tasks such as reports, data transfers and document generation took hours each week.",
    contribution: "Scripts and small services that run these tasks on a schedule or on demand.",
    stack: ["Python", "REST APIs", "PostgreSQL"],
    features: ["Scheduled jobs", "API and database integrations", "Fewer manual steps, fewer errors"],
    nodes: { "PYTHON JOB": "A scheduled Python service: fetch, transform, deliver.", "REPORTS": "Recurring reports built and sent automatically.", "DATA SYNC": "Data moved between systems through their APIs.", "DOCUMENTS": "Documents generated from templates." },
    source: "https://github.com/itsvineetwork-oss",
    images: ["/shots/automation-1.png"],
    links: [{ label: "GitHub", href: "https://github.com/itsvineetwork-oss" }],
    diagram: "automation",
  },
];

export const experience = [
  {
    company: "Premnath Rail",
    role: "Software Developer",
    period: "Present", // TODO add start date, e.g. "2023 — Present"
    points: ["Built and maintain the PremnathRail ERP", "Python engineering calculators for the engineering team", "Automation of reporting and document workflows"],
  },
];

export const skills: { category: string; items: string[]; icon: "code" | "server" | "browser" | "database" | "cloud" | "link" }[] = [
  { category: "Programming", items: ["Python", "JavaScript", "TypeScript", "C"], icon: "code" },
  { category: "Backend", items: ["FastAPI", "REST APIs", "SQLAlchemy"], icon: "server" },
  { category: "Frontend", items: ["HTML", "CSS", "JavaScript", "Next.js", "React"], icon: "browser" },
  { category: "Database", items: ["PostgreSQL", "SQL"], icon: "database" },
  { category: "Infrastructure", items: ["Docker", "VPS deployment", "Git"], icon: "cloud" },
  { category: "Integrations", items: ["Microsoft Entra ID", "SharePoint"], icon: "link" },
];

export const education = [
  {
    degree: "BCA — Bachelor of Computer Applications",
    institution: "", // TODO institution name
    period: "",      // TODO years
    notes: ["Programming fundamentals, data structures, databases", "Web development and software engineering"],
  },
];

/** Credentials and coding profiles, drawn as stamps under Education. Empty list: nothing is shown. */
export const credentials: { label: string; issuer?: string; href?: string }[] = [
  // TODO e.g. { label: "AWS Cloud Practitioner", issuer: "Amazon", href: "https://..." }
];

/** A short quote from someone you built for. Shown only when filled. */
export const testimonial = { quote: "", author: "", role: "" };

/** 30-second summary card in the hero. */
export const tldr = {
  target: "Full-stack / backend software developer",
  stack: ["Python", "FastAPI", "Next.js", "TypeScript", "PostgreSQL", "Docker"],
  experience: "End-to-end ERP and automation builder at Premnath Rail",
  availability: "Open to roles", // TODO e.g. "Immediate · remote or relocation"
};

export const contactInfo = {
  email: "",      // TODO e.g. "you@example.com" (rendered only when filled)
  linkedin: "",   // TODO e.g. "https://www.linkedin.com/in/your-handle"
  github: "https://github.com/itsvineetwork-oss",
  resume: "/resume.pdf", // put resume.pdf in /public; the link only appears when the file exists
  whatsapp: "",   // TODO international number without spaces, e.g. "919876543210"; shows a WHATSAPP row
  schedule: "",   // TODO booking link, e.g. "https://cal.com/you/15min"; shows a SCHEDULE CALL row
  /** Formspree (or similar) endpoint, e.g. "https://formspree.io/f/abcdwxyz". Blank: the form opens the visitor's mail app instead (needs `email`). */
  formEndpoint: "",
};
export const contact = contactInfo;

/** Optional analytics. provider: "goatcounter" (site = your code, e.g. "vineet"), "plausible" (site = domain), "umami" (site = website id, host = script URL). */
export const analytics: { provider: "" | "goatcounter" | "plausible" | "umami"; site: string; host?: string } = { provider: "", site: "" };

export const ui = {
  nav: { home: "Home", about: "About", projects: "Projects", experience: "Experience", skills: "Skills", education: "Education", contact: "Contact" },
  headings: { about: "About", projects: "Projects", experience: "Experience", skills: "Skills", education: "Education", contact: "Contact" },
  explore: "Explore the sketchbook ↓",
  whoIAm: "WHO I AM",
  approach: "HOW I APPROACH ENGINEERING PROBLEMS",
  problem: "PROBLEM",
  contribution: "MY CONTRIBUTION",
  stack: "STACK",
  outcome: "OUTCOME",
  copied: "COPIED",
  downloadCv: "Download CV ↓",
  inspect: "Inspect case study →",
  liveDemo: "Live demo ↗",
  sourceCode: "Source code </>",
  tldrOpen: "30-sec TL;DR",
  tldrClose: "Close",
  tldr: { target: "ROLE TARGET", stack: "CORE STACK", experience: "EXPERIENCE", availability: "AVAILABILITY" },
  credentials: "CREDENTIALS & PROFILES",
  caseStudy: "CASE STUDY",
  tradeoffs: "DECISIONS & TRADE-OFFS",
  features: "KEY FEATURES",
  dispatched: "DISPATCHED",
  views: {
    recruiter: "Recruiter view: experience and education first, CV at the top.",
    founder: "Founder view: the ERP case study and outcomes first.",
    developer: "Developer view: architecture, stack and code first.",
  },
  strip: { status: "STATUS", statusValue: "OPEN TO ROLES", location: "LOCATION", focus: "FOCUS", focusValue: "FULL-STACK & AUTOMATION" },
  screenshots: "SCREENSHOTS",
  notebook: "ENGINEERING NOTEBOOK  -  SELECTED WORK",
  blueprint: "TECHNICAL BLUEPRINT  -  SCALE 1:1",
  lastPage: "LAST PAGE OF THE SKETCHBOOK",
  sayHello: "say hello",
  openTo: "Open to software and automation work. The fastest way to reach me is email.",
  resumePdf: "RESUME (PDF)",
  now: "NOW",
  signature: "- Vineet",
  buttons: { resume: "Resume", soundOn: "Sound: on", soundOff: "Sound: off", blueprint: "Blueprint", paper: "Paper" },
  toasts: { stillDrawing: "This page is still being drawn. Please wait.", finishFirst: "Let this page finish first." },
  form: { name: "Your name", email: "Your email", message: "Message", send: "Send message", invalid: "Please fill in your name, a valid email and a message.", sending: "Sending…", sent: "Sent. I will reply by email.", failed: "Could not send. Please email me directly.", opening: "Opening your mail app…", notConnected: "The form is not connected yet (set contact.formEndpoint or contact.email)." },
  filters: { all: "All", label: "Filter by stack" },
  footer: "Drawn live with SVG strokes · no video",
};

export type Content = {
  identity: typeof identity;
  about: typeof about;
  projects: Project[];
  experience: typeof experience;
  skills: typeof skills;
  education: typeof education;
  contact: typeof contactInfo;
  ui: typeof ui;
};

export const en: Content = { identity, about, projects, experience, skills, education, contact: contactInfo, ui };
