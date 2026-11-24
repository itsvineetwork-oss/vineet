import { en, type Content } from "./content";
import { hi } from "./content.hi";

export type Lang = "en" | "hi";
const all: Record<Lang, Content> = { en, hi };

let current: Lang = "en";
try { const saved = localStorage.getItem("lang"); if (saved === "hi" || saved === "en") current = saved; } catch {}

export const lang = () => current;
export const C = () => all[current];
export function setLang(l: Lang) { current = l; try { localStorage.setItem("lang", l); } catch {} document.documentElement.lang = l === "hi" ? "hi" : "en"; }
