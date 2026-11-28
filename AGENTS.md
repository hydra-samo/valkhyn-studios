# AGENTS.md — VALKHYN portfolio

Operating rules for this repo. It is a standalone site: no BRAND/ tree, no v1.x snapshots.

## Run

- `npm ci` then `npm run dev` — dev server on **port 1717** (strict), not Vite's 5173.
- `npm run build` — `tsc --noEmit` + `vite build` → `dist/`.
- `npm run lint` — typecheck only. Both must be clean before pushing; the deploy workflow runs the build.
- Deploy: Cloudflare Workers Builds publishes `dist/` as the `valkhyn-site` Worker on every push to `main`; canonical site is `https://www.valkhyn.site/`. The GitHub Pages workflow remains a mirror only.

## Code

- **Relative imports only** (`../components/Nav`). There is no `@` alias.
- Tailwind v4, CSS-first in `src/index.css`. Use `cn()` from `src/lib/utils.ts` for conditional classes; use `assetUrl()` for anything under `public/`.
- `vite.config.ts` has `base: './'` — keep it; the build also inlines the stylesheet to remove a render-blocking request.
- Chapters are one component each in `src/components/`; all copy lives in `src/i18n/translations.ts` (EN / FR / AR, full RTL).

## Content

- **No fake content.** Work stays empty until real, released projects exist; its empty state is intentional. Never invent clients, metrics, testimonials or audio.
- Contact is a `mailto:` brief composed in the visitor's mail app — no backend, no form endpoint, no `.env` needed. Don't add a server-side form. Social icons are monochrome placeholders until real profile URLs exist.

## Brand

- Mark: `ValkhynLogo.tsx` (icon only, frozen geometry `viewBox="11 2.94 78 78"`). Navbar lockup: `ValkhynLockup.tsx` — generated from the certified `BRAND/ASSETS/LOGO_LOCKUPS` horizontal asset. No text, initials, borders; no baked-in glow; **no spinning**.
- Palette: emerald `#10b981` / `#059669` / `#34d399` as the accent family, on abyssal slate `#060c09` / `#0b1410` in dark and neutral `#f5f7f4` / `#ffffff` in light. Flat surfaces only; never a green wash, green panels, gradients, glass or decorative glow.
- Themes: `data-theme` on `<html>` selects the token set; `ThemeContext` persists `valkhyn-theme` and follows the OS preference until the visitor chooses. Public components use `var(--md-sys-color-*)` only.
- Forbidden: neon cyan, blue gradients, `// SECTION` eyebrow pills, numbered SaaS badges, comparison tables, location badges, emoji in UI copy, card grids in public chapters, and pulsing availability dots. The hero uses one muted process video; other chapters use flat bands and ruled rows.
- Typography: Manrope (display), IBM Plex Sans (body/UI), IBM Plex Sans Arabic (AR), JetBrains Mono (readouts only).
- Icons: `lucide-react` only, except the four outline brand marks in `SocialIcons.tsx`: Facebook and Instagram use lucide; WhatsApp and TikTok use local monochrome outline SVG paths (no filled brand colours).
- Shape: media frames use 32px rounded corners; buttons, language chips and icon controls use pill radii. Keep surfaces flat — rounding is not a card, glass or glow.
- Motion: purposeful, `prefers-reduced-motion` respected everywhere.
