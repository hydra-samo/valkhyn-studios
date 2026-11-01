# HYDRA SAMO LABS

The portfolio of **Bendali Issam Eddine (Hydra Samo)** — video editing, motion design, and
voice-over as one discipline. Dark bio-organic editorial: Mythic Emerald on Abyssal Slate.

**Live:** https://hydra-samo.github.io/HYDRA-SAMO-LABS/

## Stack

React 19 · TypeScript · Vite 6 · Tailwind v4 · GSAP · Lenis

No backend, no router — one page: hero → about → services → work → process → contact,
trilingual **EN / FR / AR** with full RTL.

## Run

```bash
npm ci
npm run dev      # http://localhost:3100
npm run build    # typecheck + production build to dist/
```

## Deploy

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`.

## Layout

```
src/components/   one file per chapter + Nav, Splash, CodedBackground, HydraLogo
src/i18n/         LanguageContext (persisted locale) + translations (EN/FR/AR)
src/data/         content — projects are intentionally empty, never fabricated
public/           hydra-mark.svg, portrait photography
```

Brand geometry, palette and motion rules are frozen — see the brand release in the
`HYDRA SAMO LABS` workspace. The mark is icon-only and never spins.
