/**
 * The Presence — portrait docking slots per section.
 * x/y are viewport units (vw/vh) applied as translate offsets from center.
 */
import type { SectionId } from '../motionEngine/assetRegistry';

export interface PortraitSlot {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  blend: string;
}

export type SlotId = SectionId | 'footer';

export const PORTRAIT_SLOTS: Record<SlotId, PortraitSlot> = {
  // Hero — large, center-right, beneath the HYDRA type
  hero: { x: 14, y: -2, scale: 1, opacity: 0.92, blend: 'normal' },
  // About — docks left, narrative wraps its negative space
  about: { x: -22, y: 0, scale: 0.88, opacity: 0.55, blend: 'soft-light' },
  // Work — compresses to slim right rail while the chapter owns the stage
  work: { x: 34, y: 4, scale: 0.52, opacity: 0.28, blend: 'screen' },
  // Process — dim ghost layer behind pinned steps
  services: { x: 0, y: 6, scale: 0.7, opacity: 0.16, blend: 'soft-light' },
  // Contact — recenters ghosted inside the converging glow
  contact: { x: 0, y: 2, scale: 0.8, opacity: 0.3, blend: 'screen' },
  footer: { x: 0, y: 10, scale: 0.5, opacity: 0.12, blend: 'screen' },
};
