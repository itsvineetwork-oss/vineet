# Vineet Sharma — Portfolio

Simple static portfolio. One HTML file, one CSS file, no build step.

| File | Purpose |
| --- | --- |
| `index.html` | Content: hero, about, work, experience, contact |
| `styles.css` | Styling, light/dark theme |
| `.github/workflows/deploy.yml` | Deploys to GitHub Pages on push to `main` |

## Edit

Change text and links directly in `index.html`.

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy

Settings → Pages → Source: **GitHub Actions**, then push to `main`.
