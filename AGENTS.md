# AGENTS.md — HYDRA SAMO LABS portfolio

Operating rules for this repo. It is a standalone site: no BRAND/ tree, no v1.x snapshots.

## Run

- `npm ci` then `npm run dev` — dev server on **port 3100** (`host 0.0.0.0`), not Vite's 5173.
- `http://<host>:3100/dashboard` — Studio Console (content imports, repo files, atmosphere,
  agent drawer). Dev server only: its `/api` lives in `studio.plugin.mjs` and is not built
  into `dist/`, so the route is inert on GitHub Pages.
- `npm run build` — `tsc --noEmit` + `vite build` → `dist/`.
- `npm run lint` — typecheck only. Both must be clean before pushing; the deploy workflow runs the build.
- Deploy: `.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to `main`.

## Code

- **Relative imports only** (`../components/Nav`). There is no `@` alias.
- Tailwind v4, CSS-first in `src/index.css`. Use `cn()` from `src/lib/utils.ts` for conditional classes; use `assetUrl()` for anything under `public/`.
- `vite.config.ts` has `base: './'` — keep it, the site is served from a `/HYDRA-SAMO-LABS/` subpath.
- Chapters are one component each in `src/components/`; all copy lives in `src/i18n/translations.ts` (EN / FR / AR, full RTL).

## Content

- **No fake content.** Work stays empty until real, released projects exist; its empty state is intentional. Never invent clients, metrics, testimonials or audio.
- Contact is `mailto:` by design — no backend, no form endpoint, no `.env` needed. Don't add an env-driven form without a real endpoint.

## Brand

- Mark: icon only, single SVG, `HydraLogo.tsx`, frozen geometry (optical frame `viewBox="11 2.94 78 78"`). No text, initials, borders; no baked-in glow; **no spinning** — glow lives in CSS utilities only.
- Palette: emerald `#10b981` / `#059669` / `#34d399` as **light**, on abyssal slate `#060c09` / `#0b1410`. Black must stay dominant; never a green wash or green panels.
- Forbidden: neon cyan, blue gradients, `// SECTION` eyebrow pills, numbered SaaS badges, comparison tables, location badges, emoji in UI copy.
- Typography: Space Grotesk (display), Manrope (body), IBM Plex Sans Arabic (AR), JetBrains Mono (readouts only).
- Icons: `lucide-react` only.
- Motion: purposeful, `prefers-reduced-motion` respected everywhere.
