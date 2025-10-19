## Open People Studio — developer notes

### Stack
- 11ty (Eleventy) static site inside `src/`
- Nunjucks templates + JSON data
- Custom CSS (`src/assets/css/style.css`) and vanilla JS
- Supabase for authentication (magic links + membership flag)
- Netlify Functions ready (see `.eleventy.js` passthrough) for future gating

### Getting started
1. Install dependencies
   ```bash
   npm install
   ```
2. Run the local server with hot reload
   ```bash
   npm run dev
   ```
   Eleventy serves on `http://localhost:8080`.
3. Build the static site
   ```bash
   npm run build
   ```
   Output renders to `_site/`.

### Auth & members area
- Supabase project settings are stored in `src/_data/site.json`.
- `src/assets/js/members.js` handles login, logout, and role-based gating.
- Membership requires the `profiles` table to expose `is_member` (boolean) and `roles` (text[] or comma string).
- Members hub modules use `data-role` attributes (`owner`, `staff`, `investor`). Update roles in Supabase to grant visibility.
- The frontend lazily loads dashboards and tools; replace placeholder URLs with production embeds.
- Server-side guard at `netlify/functions/guard.js` expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. It validates the bearer token and confirms `is_member` before returning roles.

### Content & structure
- Navigation data: `src/_data/nav.json`
- Pages:
  - `/` — `src/index.njk`
  - `/studio/` — `src/pages/studio.njk`
  - `/members/` — `src/pages/members.njk`
  - `/whitepaper/` — `src/pages/whitepaper.njk`
  - `/about/` — `src/pages/about.njk`
  - `/privacy/` — `src/pages/privacy.njk`
- Assets copied from `src/assets/**` and `src/public/**`. The latest white paper lives at `src/public/cortex-whitepaper-latest.pdf`.
- Hero preview placeholders are located in `src/public/preview/`. Replace with real screenshots before launch.

### Deploy checklist
- Update `CNAME`, `robots.txt`, and `sitemap.xml` if the domain changes again.
- Ensure Supabase profiles contain correct role data.
- Swap placeholder pricing values and calendar link in `studio.njk`.
- Replace tool/dashboard URLs with production endpoints.
- Run Lighthouse (targets: Perf ≥ 90, Acc ≥ 95, SEO ≥ 95).

### Deploy & Troubleshooting

**Verify DNS**
- `dig NS openpeople.world +short`
- `dig A openpeople.world +short`
- `dig CNAME www.openpeople.world +short`

**Verify site**
- `curl -I https://openpeople.world`
- Expect `HTTP/2 200` with TLS OK

**Common fixes**
- Missing styling usually means asset paths are wrong or not published — use root-absolute `/assets/...`.
- Add `CNAME` + `.nojekyll` to the publish root (the workflow writes them into `_site/`).
- Purge the Cloudflare cache after deploy.
- If TLS is stuck, remove the custom domain in Pages → save → re-add → save.
