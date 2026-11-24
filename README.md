# Vineet — The Dimension Gallery

An architectural portfolio: six exhibition rooms you walk through in first person.
White concrete, glass, polished floors, brass details, and Escher-style stairs that go nowhere.

**Rooms:** Profile → Skills → Projects → Engineering Lab → Career Journey → Contact

**Stack:** Next.js 16 · React Three Fiber · Three.js · drei · GSAP · zustand

## Navigation

| Input | Action |
| --- | --- |
| `W A S D` / arrows | Walk (hold `Shift` to move faster) |
| Mouse | Look (click the scene to lock the pointer, `Esc` to release) |
| Scroll | Travel to the next / previous room (cinematic camera) |
| Click an artwork | Dolly in and open its case study |
| Room plan (bottom right) | Jump to any room |
| Touch | Drag to look, arrow buttons to travel, tap an artwork to open |

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Edit content

Everything shown in the gallery lives in `src/data/gallery.ts`:

- `rooms[]` — the six rooms, their accent colour and artworks.
- Each artwork has a `title`, `subtitle`, `lines` (rendered onto the canvas "artwork"), a wall `position` / `rotation` / `size`, and a `study` (the case study panel).
- Set `image: "/art/your-file.jpg"` on an artwork to show a real image instead of the typographic one. Put files in `public/art/`.
- Set `floating: true` to make a frame hover in the air.

Contact links are in the Contact room's artworks.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/` | Next.js app router: layout, page, global CSS |
| `src/components/Experience.tsx` | Canvas, lights, environment, floor |
| `src/components/Room.tsx` | Walls, doorways, ceiling light slot, glass partition, stairs, floating frame |
| `src/components/Corridor.tsx` | Glass passage between rooms |
| `src/components/Artwork.tsx` | Framed artwork with picture light, hover and click |
| `src/components/Player.tsx` | WASD + pointer lock, scroll travel, GSAP camera choreography |
| `src/components/Hud.tsx` | Room title, controls, plan, reticle, enter screen |
| `src/components/CaseStudy.tsx` | Sliding case study panel |
| `src/lib/textures.ts` | Canvas-rendered artwork textures |
| `src/data/gallery.ts` | All content |

## Deploy

Static export (`next build` → `out/`). The GitHub Actions workflow deploys to GitHub Pages on push to `main`.
In the repository: Settings → Pages → Source: **GitHub Actions**.

For a custom domain or Vercel, remove `NEXT_PUBLIC_BASE_PATH` from the workflow (or leave it unset).
