# Vineet Sharma — Portfolio

Static personal portfolio site. No build step, no dependencies.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page layout and sections |
| `data.js` | Skills, projects, and experience content |
| `styles.css` | Styling, light/dark theme |
| `script.js` | Renders content from `data.js`, theme toggle |
| `.github/workflows/deploy.yml` | Deploys to GitHub Pages on push to `main` |

## Edit content

Update `data.js` for skills, projects, and experience.
Update the hero text and contact links in `index.html`.

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy

1. Repository → Settings → Pages → Source: **GitHub Actions**.
2. Push to `main`.
