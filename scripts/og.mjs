// Renders the finished Home sheet to public/og.png (1200x630). Run with the preview server up: `npm run preview` then `node scripts/og.mjs`.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // needs playwright installed (globally is fine)
const url = process.argv[2] || "http://127.0.0.1:4173/";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(800);
await p.evaluate(() => { document.documentElement.setAttribute("data-theme", "paper"); document.getElementById("finish").click(); });
await p.waitForTimeout(600);
const r = await p.evaluate(() => { const s = document.querySelector("#home svg.stage").getBoundingClientRect(); return { x: s.x, y: s.y, w: s.width, h: s.height }; });
const H = r.w * 630 / 1200;
await p.screenshot({ path: "public/og.png", clip: { x: r.x, y: r.y - 22, width: r.w, height: H } });
await b.close();
console.log("wrote public/og.png");
