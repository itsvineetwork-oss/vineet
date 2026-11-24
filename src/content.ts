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
    images: [], // TODO add screenshots
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

export const contact = {
  email: "",      // TODO e.g. "you@example.com" (rendered only when filled)
  linkedin: "",   // TODO e.g. "https://www.linkedin.com/in/your-handle"
  github: "https://github.com/itsvineetwork-oss",
  resume: "",     // TODO e.g. "/resume.pdf" after adding the file to /public
};
