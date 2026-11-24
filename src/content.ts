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
  /** Photo under /public (3:4 or square). Sketched first, then revealed. If the file is missing, a monogram is drawn instead. */
  photo: "/portrait.jpg",
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

export const contactInfo = {
  email: "",      // TODO e.g. "you@example.com" (rendered only when filled)
  linkedin: "",   // TODO e.g. "https://www.linkedin.com/in/your-handle"
  github: "https://github.com/itsvineetwork-oss",
  resume: "/resume.pdf", // put resume.pdf in /public; the link only appears when the file exists
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
