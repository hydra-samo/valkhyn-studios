/**
 * HYDRA Motion Engine — Asset Registry (v2)
 *
 * Simplified: 5 ambient layers + 1 signature = 6 total video layers.
 * Higher base opacity, normal/overlay blend modes, no Three.js conflict.
 */

export type AssetRole =
  | 'environment_primary'
  | 'environment_secondary'
  | 'environment_haze'
  | 'atmospheric_wisp'
  | 'atmospheric_dust'
  | 'geometric_form'
  | 'geometric_fragment'
  | 'signature'
  | 'hold';

export type DepthLayer =
  | 'haze'
  | 'env_secondary'
  | 'env_primary'
  | 'dust'
  | 'wisp'
  | 'geometry'
  | 'content';

export interface AssetConfig {
  id: string;
  src: string;
  role: AssetRole;
  depth: DepthLayer;
  zIndex: number;
  baseOpacity: number;
  blendMode: 'screen' | 'normal' | 'overlay' | 'soft-light' | 'luminosity';
  sections: string[] | null;
  velocityInfluence: number;
  parallaxSpeed: number;
  lazy: boolean;
  lowTier: boolean;
  mediumTier: boolean;
}

export const ASSETS: AssetConfig[] = [
  // ── HAZE (z-0) — deepest fill, always visible ─────────────────
  {
    id: 'haze',
    src: '/motion/10.mp4',
    role: 'environment_haze',
    depth: 'haze',
    zIndex: 0,
    baseOpacity: 0.25,
    blendMode: 'soft-light',
    sections: null,
    velocityInfluence: 0.05,
    parallaxSpeed: 0.3,
    lazy: false,
    lowTier: false,
    mediumTier: true,
  },

  // ── ENV SECONDARY (z-10) — blue wash ──────────────────────────
  {
    id: 'env-secondary',
    src: '/motion/07.mp4',
    role: 'environment_secondary',
    depth: 'env_secondary',
    zIndex: 10,
    baseOpacity: 0.30,
    blendMode: 'screen',
    sections: null,
    velocityInfluence: 0.08,
    parallaxSpeed: 0.4,
    lazy: false,
    lowTier: false,
    mediumTier: true,
  },

  // ── ENV PRIMARY (z-20) — green volumetric ─────────────────────
  {
    id: 'env-primary',
    src: '/motion/06.mp4',
    role: 'environment_primary',
    depth: 'env_primary',
    zIndex: 20,
    baseOpacity: 0.22,
    blendMode: 'screen',
    sections: null,
    velocityInfluence: 0.10,
    parallaxSpeed: 0.5,
    lazy: false,
    lowTier: false,
    mediumTier: true,
  },

  // ── DUST (z-30) — fine particles ──────────────────────────────
  {
    id: 'dust',
    src: '/motion/09.mp4',
    role: 'atmospheric_dust',
    depth: 'dust',
    zIndex: 30,
    baseOpacity: 0.18,
    blendMode: 'screen',
    sections: null,
    velocityInfluence: 0.12,
    parallaxSpeed: 0.6,
    lazy: true,
    lowTier: false,
    mediumTier: true,
  },

  // ── WISP (z-40) — organic drift ──────────────────────────────
  {
    id: 'wisp',
    src: '/motion/08.mp4',
    role: 'atmospheric_wisp',
    depth: 'wisp',
    zIndex: 40,
    baseOpacity: 0.20,
    blendMode: 'overlay',
    sections: null,
    velocityInfluence: 0.15,
    parallaxSpeed: 0.7,
    lazy: true,
    lowTier: false,
    mediumTier: true,
  },

  // ── GEOMETRY (z-50) — abstract forms, work section ────────────
  {
    id: 'geometry-primary',
    src: '/motion/03.mp4',
    role: 'geometric_form',
    depth: 'geometry',
    zIndex: 50,
    baseOpacity: 0.15,
    blendMode: 'screen',
    sections: ['work'],
    velocityInfluence: 0.25,
    parallaxSpeed: 0.85,
    lazy: true,
    lowTier: false,
    mediumTier: true,
  },

  // ── FRAGMENT (z-60) — signature #20 icosahedron video ─────────
  {
    id: 'env-fragment',
    src: '/motion/20.mp4',
    role: 'signature',
    depth: 'geometry',
    zIndex: 60,
    baseOpacity: 0.12,
    blendMode: 'screen',
    sections: ['work'],
    velocityInfluence: 0.18,
    parallaxSpeed: 0.75,
    lazy: true,
    lowTier: false,
    mediumTier: true,
  },
];

/** Only assets that are actually loaded and rendered. */
export const ACTIVE_ASSETS = ASSETS.filter((a) => a.role !== 'hold');

/** Section IDs as they appear in the DOM (`data-section`). */
export const SECTIONS = ['hero', 'about', 'work', 'services', 'contact'] as const;
export type SectionId = (typeof SECTIONS)[number];
