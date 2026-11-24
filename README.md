# Vineet — The Live Sketch Portfolio

A portfolio that is drawn in front of the visitor. Every section reveals itself through animated pencil strokes:
handwritten headings, technical diagrams, annotations and illustrations. A pencil cursor that follows the line is available (`PENCIL` flag in `src/engine/director.ts`, off by default).

Nothing is a video. Every stroke is an SVG path animated from its real geometry.

## Stack (chosen after research)

| Need | Choice | Why |
| --- | --- | --- |
| Build | Vite + TypeScript, no framework | Static site, tiny bundle, no hydration |
| Handwriting | Hershey single-stroke fonts (`hersheytext`, MIT) | Real stroke paths, so letters are *written*, not outlined. Only 4 fonts are bundled (`npm run fonts`) |
| Sketchy shapes | `roughjs` (MIT) | Boxes, arrows, cylinders and hatching that look hand-drawn |
| Sequencing | GSAP 3 + ScrollTrigger + ScrollTo | Timelines, scroll-linked playback, cinematic scroll |
| Drawing engine | custom (`src/engine`) | stroke-dashoffset reveal, pencil follows `getPointAtLength`, erase, sketch-to-image |

Evaluated and not used: Vara.js (needs its own JSON fonts from a CDN, no erase/sequence control), Paper.js / Two.js / PixiJS (canvas scene graphs add weight without helping stroke animation), React Three Fiber (the 3D gallery was prototyped earlier and rejected).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run preview
```

## Edit content

- `src/content.ts` — identity, about, projects, experience, skills, education, contact. Fields marked `TODO` are not verified yet; blank fields are not rendered.
- `index.html` — the accessible HTML text of every section (what search engines and screen readers read). Keep it in sync with `content.ts`.
- Screenshots: put images in `public/shots/` and list them in a project's `images` array. They are revealed with a sketch-to-image effect.
- Resume: put `resume.pdf` in `public/` and set `contact.resume = "/resume.pdf"`.

## How the drawing engine works

```
src/engine/
  hershey.ts   text -> per-character stroke paths (Hershey fonts), with size, tracking, alignment
  sketch.ts    Sketcher: path / line / rect / ellipse / arrow / text / label / dimension / image -> Strokes
  director.ts  Director: draw / write / erase / reveal / revealImage on one GSAP timeline; moves the pencil
  pencil.ts    the pencil cursor
  sound.ts     optional pencil-scratch ambience (off by default)
src/sections/  one scene per section: lays out strokes and the timeline
src/main.ts    scroll triggers, navigation, toolbar (Finish / Animations / Sound)
```

A section draws itself when it scrolls into view, one page at a time: the visitor cannot scroll or navigate past a page until it is drawn ("Finish" skips ahead). Clicking a menu item erases the current page, scrolls, and draws the target; pages already drawn are simply shown.

## Accessibility and performance

- All text exists as real, selectable HTML. The SVG drawings are `aria-hidden`.
- `prefers-reduced-motion` and the "Animations: off" toggle show the finished drawings immediately.
- Keyboard: skip link, focusable navigation and buttons.
- No WebGL, no large assets. The whole site is ~76 kB gzipped.

## Deploy

GitHub Actions deploys `dist/` to GitHub Pages on push to `main` (Settings → Pages → Source: GitHub Actions).
For a custom domain or another host, build with `BASE_PATH=/` (the default).

## Not built (by decision)

The optional 3D gallery (section 6 of the brief) was prototyped as a separate version and set aside.
The drawing engine and scenes are independent of it and could be placed on gallery walls later.
