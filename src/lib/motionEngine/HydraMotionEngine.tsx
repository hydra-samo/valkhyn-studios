import { useMemo } from 'react';
import { ACTIVE_ASSETS } from './assetRegistry';
import { useMotionStore } from './MotionStore';
import { VideoLayer } from './VideoLayer';

interface HydraMotionEngineProps {
  deviceTier: 'low' | 'medium' | 'high';
}

/**
 * HYDRA Motion Engine — video atmosphere layers behind all site content.
 *
 * Simplified v2: no Three.js, just 6 video layers with CSS blend modes.
 * Content sits above at z-80.
 *
 * Layer stack (back to front):
 *   haze → env-secondary → env-primary → dust → wisp → geometry → signature
 *   ─────────────────── CONTENT (z-80) ───────────────────
 *
 * Performance tiers:
 *   low    → engine completely disabled
 *   medium → 4 ambient layers (~8MB)
 *   high   → all 6 layers (~14MB, lazy-loaded)
 */
export function HydraMotionEngine({ deviceTier }: HydraMotionEngineProps) {
  const store = useMotionStore();

  const visibleAssets = useMemo(() => {
    return ACTIVE_ASSETS.filter((asset) => {
      if (deviceTier === 'low') return false;
      if (deviceTier === 'medium') return asset.mediumTier;
      return true;
    });
  }, [deviceTier]);

  if (deviceTier === 'low') return null;

  return (
    <div
      className="hydra-motion-engine"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {visibleAssets.map((asset) => (
        <VideoLayer
          key={asset.id}
          asset={asset}
          motionStore={store}
          affordable={true}
        />
      ))}
    </div>
  );
}
