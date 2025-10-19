# Open People — Minimal Futuristic Landing

- Edit content: `index.html`
- Edit styles: `assets/css/style.css`
- Logo/Favicon: `assets/img/`
- Eurostile font: put `assets/fonts/Eurostile.woff2` to enable headings; otherwise system fallback is used.
- Login button points to `https://dash.openpeople.world` (auth lives in dashboards repo).

## Deploy
- GitHub Pages serves from `main` root.
- Required at root: `CNAME` with `openpeople.world`, `.nojekyll`.

## Notes
- Motion respects `prefers-reduced-motion`.
- Interactives use only transform/opacity for perf.
