# HYDRA SAMO Portfolio — v2 Hybrid Redesign

Date: 2026-08-23 · Status: approved in chat (user: "approuved go for it")

## Goal

Full polish rebuild of the PORTFOLIO site to premium standard: hybrid motion
architecture combining a MotionValue spine, choreographed portrait, GSAP pinned
scenes, and one lazy WebGL hero moment. Dark emerald cinematic brand unchanged.

## Architecture

Four animation tools over native scroll, each scoped:

| Tool | Role |
|---|---|
| Lenis | smooth wheel scroll (existing; skipped low-tier + mobile) |
| MotionStore (`src/lib/motionEngine/`) | shared MotionValues: scrollProgress, velocity, direction, currentSection, sectionProgress, transitionProgress, motionIntensity, dampedVelocity. Drives portrait + video atmosphere with zero per-frame React renders |
| GSAP ScrollTrigger | two pinned set-pieces: horizontal Work chapter, pinned Process steps |
| Framer Motion 12 | micro-interactions, springs, AnimatePresence, layout animations |
| Three.js (lazy chunk) | Hero-only particle Hydra mark reacting to cursor + scroll velocity. High-tier devices only |

Tier gating (useDeviceTier → `html[data-quality]`): low = CSS-only reveals,
no Lenis, no videos, no WebGL, no pinning (sections stack statically).

Z-sandwich: bg(0) < atmosphere videos(1) < portrait(2) < content(10) < nav(50) < grain(9999).

## The Presence (choreographed portrait)

Canvas frame-player (300 frames `/portrait-cutout/frame-NNN.png`, batched
loading of 20) driven by MotionStore subscription instead of context setState
(kills the per-frame re-render storm).

Docking slot config per section: `{x%, y%, scale, opacity, blend, parallax}`:

- hero: center-right, large, beneath HYDRA type
- about: docks left; narrative column wraps its negative space; soft-light blend
- work: compresses to slim right rail while horizontal chapter owns stage
- services(process): dim ghost layer behind pinned steps
- contact: recenters ghosted inside converging emerald glow

Slots interpolate with spring damping across scroll boundaries + subtle
velocity-driven drift. Per-slot composition rules prevent sticker feel.
Mobile slideshow: instant per-slide positioning, no scrub.

## Section set-pieces

- **Hero**: lazy Three.js particle field forming/reacting as Hydra mark;
  cursor-reactive + scroll-velocity-reactive; monumental fluid type (~12vw);
  scroll cue. WebGL unmounts below hero and never mounts on medium/low tier
  (medium gets static glow instead).
- **Work**: GSAP horizontal chapter — viewport pins, project cards travel
  horizontally with scroll progress. Card click → full-screen takeover case
  study: video player slot, client brief, software stack, deliverables,
  prev/next, Esc/close. Honest designed empty-state while PROJECTS is empty
  (no fake content rule). Voice "coming soon" equalizer stays at chapter end.
- **Process**: steps pin and swap via scrub — number scales huge, content
  crossfades; releases into comparison manifesto (editorial, kept).
- **Contact**: form restyle, animated success state, all strings through i18n
  (fixes hardcoded English). Env-gated submission behavior unchanged.
- **Footer**: quiet, unchanged structure.

## Atmosphere engine wiring

1. Copy/rename MP4s from `../HYDRA MOTION ENGINE/ASSET_NN_*.mp4` →
   `public/motion/NN.mp4` for ids the registry actively uses:
   03, 06, 07, 08, 09, 10, 20 (hold assets 01/15/16 are NOT shipped).
2. Fix registry SectionId union to real DOM ids: hero/about/work/services/contact.
3. Mount MotionStoreProvider + HydraMotionEngine in App under ScrollProvider.
4. Tier behavior preserved (low=off, medium=4 layers, high=6).

## Craft layer

- ONE easing family from `src/lib/motionTokens.ts`: cinematic `[0.22,1,0.36,1]`
  primary (+ snappy spring for micro). Replace all hardcoded duration/ease
  literals with token imports.
- Fluid clamp() type scale; display sizes up to ~12vw hero.
- Custom cursor: dot + trailing ring, context states (expand over cards, hide
  over text), fine-pointer only.
- Fixed scroll-progress rail + chapter markers on left edge (desktop).
- Film grain overlay kept.

## Data / i18n / a11y / budgets

- Single projects data schema feeds cards + takeover: id, title, client, year,
  category, tag, media {poster, videoUrl}, brief, stack[], deliverables[].
- All new copy via `src/i18n/translations.ts` (EN/FR/AR).
- prefers-reduced-motion: pins disabled, sections stack statically, portrait
  static slot, videos/WebGL off.
- Keyboard: takeover closable via Esc, focus trapped, focus-visible styles.
- Budgets: main bundle ≤160KB gz; three chunk lazy ≤700KB gz (high-tier only);
  videos preload=metadata; verified via build output + Helium passes at 3 tiers
  + keyboard pass + reduced-motion pass.

## Phases (each = own commit)

- P0 spine: assets → public/motion, registry ids fixed, providers mounted
- P1 Presence: portrait on MotionStore, docking slots
- P2 craft: tokens enforcement, fluid type, custom cursor, progress rail
- P3 Work: horizontal chapter + takeover system
- P4 Process: pinned step scene
- P5 Hero: WebGL signature (lazy)
- P6 audit: budgets, a11y sweep, tier passes, polish
