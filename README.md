<p align="center">
  <a href="https://hydra-samo.github.io/valkhyn-studios/">
    <img src="./public/valkhyn-mark.svg" width="96" alt="VALKHYN" />
  </a>
</p>

<h1 align="center">VALKHYN — Portfolio Website</h1>

<p align="center">
  <strong>Video editing · Motion design · Voice-over — one unified head.</strong>
</p>

<p align="center">
  A dark bio-organic editorial portfolio by <strong>Bendali Issam Eddine (VALKHYN)</strong> —
  the mythical three-headed craft, directed under a single will.
</p>

---

This repository is the **production website**, the self-contained tree that GitHub
Actions builds and deploys to GitHub Pages:

**https://hydra-samo.github.io/valkhyn-studios/**

The site is one page in six chapters — hero → about → services → work → process →
contact — written in **EN / FR / AR** with full RTL. Stack: React 19, TypeScript
strict, Vite 6, Tailwind v4, GSAP, Lenis. No backend, no router.

## Run locally

```bash
npm ci
npm run dev        # http://localhost:3100
```

## Build / checks

```bash
npm run build      # typecheck + production build to dist/
npm run lint       # TypeScript typecheck only (tsc --noEmit)
```

Both must be clean before pushing — the deploy workflow runs the same build.

## Deploy

`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to
`main` (and on manual dispatch). `vite.config.ts` keeps `base: './'` so assets
resolve from the `/valkhyn-studios/` subpath.

## Configuration

None. The site is fully static: no environment variables, no API keys, no form
endpoint. The contact section composes a real `mailto:` brief, so it works
everywhere with zero setup.

## Content

- **Copy** — every string lives in `src/i18n/translations.ts` (EN / FR / AR); the
  locale is persisted and RTL is applied from the same source.
- **Work** — `src/data/content.ts` stays empty until real, released projects
  exist. The gallery's empty state is deliberate: no fabricated case studies,
  clients, metrics or audio.
- **Images** — portraits live in `public/portrait/` (hero and about cutouts);
  `valkhyn-mark.svg` is the only logo file.
- **Metadata** — Open Graph, Twitter card, CSP, PWA icons and `site.webmanifest`
  are declared in `index.html`; `valkhyn_logo.jpg` is the share image.

## Performance & access

`src/hooks/useDeviceTier.ts` classifies the device (`low` / `medium` / `high`
from cores, memory, network class and pointer) and mirrors it to
`<html data-quality>`; the canvas field, the grain overlay and Lenis smooth
scroll all step down accordingly. `prefers-reduced-motion` is honoured in every
animated component.

## Structure

```
src/components/   one file per chapter + Nav, Footer, Splash, CodedBackground
src/hooks/        useDeviceTier, useLenis
src/i18n/         LanguageContext + translations
src/data/         content (projects intentionally empty)
public/           mark, PWA icons, manifest, share image, portraits
```

---

<p align="center">
  <sub>Dark bio-organic editorial — Mythic Emerald on Abyssal Slate.</sub>
</p>
