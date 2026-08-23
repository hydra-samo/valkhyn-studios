# HYDRA v2 Hybrid Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Premium hybrid rebuild of PORTFOLIO: wired atmosphere engine, choreographed portrait, GSAP pinned scenes, lazy WebGL hero, enforced craft tokens.

**Architecture:** Lenis + shared MotionStore drive portrait/videos re-render-free; GSAP ScrollTrigger owns the two pinned set-pieces; Framer Motion owns micro/UI; Three.js is one lazy high-tier-only hero field.

**Tech Stack:** React 19, Vite 6, TS strict, Tailwind v4, Framer Motion 12, GSAP 3 (+ScrollTrigger), Lenis, Three.js (lazy dynamic import).

**Spec:** `docs/superpowers/specs/2026-08-23-hydra-v2-hybrid-redesign-design.md`

## Global Constraints

- Easing tokens ONLY from `src/lib/motionTokens.ts`; `ease.cinematic = [0.22, 1, 0.36, 1]`, `ease.snappy = [0.34, 1.56, 0.64, 1]`. No new cubic-beziers inline.
- Durations ONLY from `duration` token map (extend it, never inline new literals).
- No fake content: PROJECTS/VOICE_TRACKS stay empty until real work exists.
- All user-facing copy through `src/i18n/translations.ts` (EN/FR/AR).
- Tier gating: low = no Lenis/videos/WebGL/pinning; medium = 4 video layers, no WebGL; high = all.
- Every phase ends with: `npx tsc --noEmit` clean + `npm run build` clean + own commit.
- Bundle budget: main ≤160KB gz; three lives in its own lazy chunk.

---

### Task P0: Spine — assets, registry truth, providers mounted

**Files:**
- Create: `public/motion/{03,06,07,08,09,10,20}.mp4` (copied from `../HYDRA MOTION ENGINE/ASSET_NN_*.mp4`)
- Modify: `src/lib/motionEngine/assetRegistry.ts` (SectionId union → hero/about/work/services/contact; delete hold entries)
- Modify: `src/App.tsx` (mount MotionStoreProvider + HydraMotionEngine)

**Interfaces:**
- Produces: `<MotionStoreProvider lenisRef>` wrapping app; `HydraMotionEngine({deviceTier})` rendered once under it; SectionId = `'hero'|'about'|'work'|'services'|'contact'`.

- [ ] Copy 7 active MP4s → `public/motion/NN.mp4`
- [ ] Registry: replace SECTIONS/SectionId, drop `hold-*` objects
- [ ] App.tsx: `const tier = useDeviceTier()`; nest `ScrollProvider > MotionStoreProvider lenisRef={lenisRef}` ; render `<HydraMotionEngine deviceTier={tier} />` fixed layer above background, below portrait
- [ ] Verify: tsc + build + dev-server smoke in Helium; commit `feat(P0): wire motion spine — assets, registry ids, providers`

### Task P1: The Presence — choreographed portrait

**Files:**
- Create: `src/lib/portrait/slots.ts`
- Rewrite: `src/components/PersistentPortrait.tsx` (MotionStore-driven)
- Delete: `src/contexts/ScrollContext.tsx` (last consumer gone)

**Interfaces:**
- Consumes: `useMotionStore().onUpdate`, `.currentSection.get()`, `.sectionProgress.get()`, `.dampedVelocity.get()`
- Produces: `PORTRAIT_SLOTS: Record<SlotId, PortraitSlot>`; `PortraitSlot = { x: number; y: number; scale: number; opacity: number; blend: string }` (x/y in vw/vh units)

- [ ] slots.ts: slots per spec table (hero/about/work/services/contact/footer)
- [ ] PersistentPortrait: rAF draw loop keeps frame blitting; slot interpolation lerps current→target each frame (`k=0.08`), velocity drift adds ±8px x-offset; writes transform/opacity/mixBlendMode directly to wrapper style (zero React state); reduced-motion → static hero slot, opacity 0.9; touch/mobile → instant slot snap
- [ ] Delete contexts/ScrollContext.tsx; App drops ScrollProvider import
- [ ] Verify: tsc/build/Helium scroll pass (no re-render storm: React DevTools highlight off); commit `feat(P1): choreographed portrait docking`

### Task P2: Craft layer

**Files:**
- Modify: `src/lib/motionTokens.ts`, all components with literal durations/eases (grep-driven), `src/index.css` (type scale utilities)
- Create: `src/components/CustomCursor.tsx`, `src/components/ProgressRail.tsx`

**Interfaces:**
- Produces: `<CustomCursor />` (self-contained, fine-pointer only, `[data-cursor]` states); `<ProgressRail />` (reads MotionStore progress; markers from SECTIONS)

- [ ] motionTokens: set cinematic `[0.22,1,0.36,1]`; sweep literals → tokens (rg audit shows ≤2 stragglers: ambient loops exempt)
- [ ] Fluid display classes: `.display-hero` clamp(3rem,12vw,...), `.display-section` clamp(2rem,7vw,...) applied to h1/h2 sites
- [ ] CustomCursor: dot+ring springs (Framer), hover expand on `a,button,[data-cursor="card"]`, hidden on text inputs/coarse pointers
- [ ] ProgressRail: fixed-left 2px rail, scaleY fill via MotionValue, chapter dots w/ tooltips, desktop only
- [ ] Verify: tsc/build/Helium; commit `feat(P2): craft layer — tokens, fluid type, cursor, progress rail`

### Task P3: Work — horizontal chapter + case takeover

**Files:**
- Create: `src/components/work/HorizontalChapter.tsx`, `src/components/work/CaseTakeover.tsx`, `src/data/projects.ts`
- Modify: `ProjectsSection.tsx`, `translations.ts` (+EN/FR/AR keys)

**Interfaces:**
- Consumes: `PROJECTS` (empty ok), gsap ScrollTrigger
- Produces: `projects.ts` schema `{id,title,client,year,category,tag,media:{poster,videoUrl},brief,stack[],deliverables[]}`; `<CaseTakeover project onClose onPrev onNext />`

- [ ] projects.ts: schema + re-export empty list (portfolioData PROJECTS moves here later; keep single source: move PROJECTS def into projects.ts)
- [ ] HorizontalChapter: if PROJECTS empty → static designed empty panel (no pin). Else pin viewport, track width = cards*n, translateX scrub via ScrollTrigger + Lenis ticker compat (`ScrollTrigger.scrollerProxy` not needed—Lenis scrolls native window)
- [ ] CaseTakeover: fullscreen overlay, poster/video slot (video only if media.videoUrl), brief/stack/deliverables grid, prev/next/Esc, focus trap, body-scroll lock via lenisRef stop
- [ ] i18n keys: work.case.brief/stack/deliverables/close/prevNext in 3 langs
- [ ] Reduced-motion: chapter renders as vertical stack (no pin)
- [ ] Verify: tsc/build/Helium keyboard pass; commit `feat(P3): horizontal work chapter + case takeover`

### Task P4: Process — pinned steps

**Files:**
- Modify: `ServicesSection.tsx` (extract `PinnedSteps` inline block or create `src/components/process/PinnedSteps.tsx`)

- [ ] Pin container for steps.length*100vh; per-step crossfade + number scale 1→6 scrub; releases into existing manifesto
- [ ] Mobile/reduced-motion/low-tier: keep current stacked editorial list (early return)
- [ ] Verify + commit `feat(P4): pinned process scene`

### Task P5: Hero — WebGL signature

**Files:**
- Create: `src/lib/three/HydraField.tsx`
- Modify: `Hero.tsx` (render HydraField when tier==='high')

- [ ] Dynamic `import('three')` inside useEffect → automatic lazy chunk; ~1400 emerald particles, additive blending, pointer parallax + dampedVelocity turbulence; pause+unload when hero out of view (IntersectionObserver)
- [ ] Medium/low tiers: existing CSS glow stays
- [ ] Verify: build shows separate three chunk ≤700KB gz; Helium high-tier visual pass; commit `feat(P5): lazy WebGL hero particle field`

### Task P6: Audit & polish

- [ ] rg sweeps: prefers-reduced-motion coverage, aria-hidden on decorative, focus-visible, zero inline cubic-beziers outside tokens
- [ ] Bundle report vs budgets; fix if over
- [ ] Helium passes: high/medium/low (force via `document.documentElement.dataset.quality`), keyboard-only pass, reduced-motion pass
- [ ] Contact form i18n completion (labels/buttons through translations)
- [ ] Final commit `chore(P6): audit — budgets, a11y, i18n completion`
