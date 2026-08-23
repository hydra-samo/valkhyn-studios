<p align="center">
  <a href="https://hydra-samo.github.io/HYDRA-SAMO-LABS/">
    <img src="./public/hydra-mark.svg" width="96" alt="Hydra Samo" />
  </a>
</p>

<h1 align="center">HYDRA SAMO — Production Website (v1.1)</h1>

<p align="center">
  <strong>Video editing · Motion design · Voice-over — one unified head.</strong>
</p>

<p align="center">
  A dark bio-organic editorial portfolio by <strong>Bendali Issam Eddine (Hydra Samo)</strong> —
  the mythical three-headed craft, directed under a single will.
</p>

---

This folder is the **production website** (`WEBSITE_v1.1`), the self-contained
shipped tree that GitHub Actions builds and deploys to GitHub Pages.

The brand authority it renders from lives one level up in `../BRAND/` — master
assets, certified release packages, governance docs, and engineering reports.
The design intent for this site is captured in `../BRAND/DESIGN.md` and the
brand book at `../BRAND/DOCUMENTATION/HYDRA_SAMO_Brand_Book_v1.0.md`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build / checks

```bash
npm run build      # production build to dist/
npm run lint       # TypeScript typecheck (tsc --noEmit)
```

## Configuration

The site is fully static. The only optional config is the contact form
submission service. Copy `.env.example` to `.env` and set:

- `VITE_FORM_ENDPOINT` — Formspree (`https://formspree.io/f/…`) or Web3Forms
  (`https://api.web3forms.com/submit`)
- `VITE_FORM_ACCESS_KEY` — required for Web3Forms only

Until an endpoint is configured the contact form shows a "not configured"
notice and will not send briefs.

## Content

- **Projects** — add real case studies to `PROJECTS` in `src/data/portfolioData.ts`
  (the gallery shows a deliberate empty state until projects exist).
- **Voice tracks** — set `audioUrl` on a `VOICE_TRACKS` entry (drop the file in
  `public/audio/`) to enable playback.
- **Images** — portraits live in `src/assets/images/` (WebP, imported via Vite);
  shared site assets live in `public/`.
- **Metadata** — `metadata.json` feeds the Open Graph / Twitter tags injected by
  `src/hooks/useOpenGraph.ts`; `og:url` auto-detects the deployed origin.

## Repository

The enclosing repo is the HYDRA SAMO LABS workspace — see `../README.md` for the
full layout (`WEBSITE_v1.1` / `BRAND`).

---

<p align="center">
  <sub>Dark bio-organic editorial — Mythic Emerald on Abyssal Slate.</sub>
</p>
