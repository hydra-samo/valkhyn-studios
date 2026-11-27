import React, { Component, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { DRACOLoader } from 'three-stdlib';
import { Group } from 'three';
import { useDeviceTier } from '../hooks/useDeviceTier';
import { assetUrl, cn } from '../lib/utils';

const AVATAR_URL = assetUrl('/models/avatar.glb');

// Preload once at module scope so the GLB starts fetching before the rig mounts.
useGLTF.preload(AVATAR_URL);

/** Minimal, non-blocking DOM placeholder shown while the GLB is in flight. */
const AvatarFallback: React.FC = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0 grid place-items-center rounded-full"
    style={{
      border: '1px solid var(--md-sys-color-outline-variant)',
      background: 'var(--md-sys-color-surface-container-low)',
      pointerEvents: 'none',
    }}
  >
    <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--md-sys-color-on-surface-faint)]">AVATAR</span>
  </div>
);

// Subpath-safe Draco decoder for the compressed final GLB (CEO: public/draco next).
const draco = new DRACOLoader();
draco.setDecoderPath(assetUrl('/draco/'));

interface AvatarErrorBoundaryProps {
  children: React.ReactNode;
}

interface AvatarErrorBoundaryState {
  failed: boolean;
}

/**
 * Degrades silently when the GLB is missing (fetch/parse failure): the rig
 * unmounts and the hero falls back to its static composition instead of
 * crashing the page before the asset exists.
 */
class AvatarErrorBoundary extends Component<AvatarErrorBoundaryProps, AvatarErrorBoundaryState> {
  state: AvatarErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AvatarErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(): void {}

  render(): React.ReactNode {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

const AvatarRig: React.FC = () => {
  const gltf = useGLTF(AVATAR_URL, false, true, (loader) => {
    loader.setDRACOLoader(draco);
  });

  const group = useRef<Group>(null);
  const pointer = useThree((state) => state.pointer);
  const tier = useDeviceTier();

  const reducedRef = useRef(false);
  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const yaw = useRef(0);
  const pitch = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const animate = !reducedRef.current && tier !== 'low';
    if (!animate) {
      g.rotation.set(0, 0, 0);
      g.position.y = 0;
      return;
    }

    // Damped pointer look-at.
    const targetYaw = pointer.x * 0.5;
    const targetPitch = -pointer.y * 0.4;
    const damp = 1 - Math.exp(-5.5 * delta);
    yaw.current += (targetYaw - yaw.current) * damp;
    pitch.current += (targetPitch - pitch.current) * damp;
    g.rotation.y = yaw.current;
    g.rotation.x = pitch.current;

    // Subtle sinusoidal breathing.
    g.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.006;
  });

  return (
    <>
      {/* Procedural studio lighting — no CDN presets, works offline. */}
      <Environment resolution={256} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          {/* Soft frontal key. */}
          <Lightformer form="rect" intensity={1.0} position={[1.5, 4, -6]} scale={[6, 4, 1]} color="#ffffff" />
          {/* Restrained emerald rim for the dark suit / sunglasses silhouette. */}
          <Lightformer form="rect" intensity={2.2} position={[-0.5, 2.5, 4]} scale={[5, 3, 1]} color="#10b981" />
          {/* Low cool fill so the suit never drops to pure black. */}
          <Lightformer form="rect" intensity={0.45} position={[-5, 2, -2]} scale={[4, 4, 1]} color="#b9c6de" />
        </group>
      </Environment>

      <group ref={group}>
        <primitive object={gltf.scene} />
      </group>

      {/* Safe framing: no zoom, no pan, no orbit — the damped rig owns motion. */}
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        enableDamping={false}
        target={[0, 0.875, 0]}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI * 0.5}
        minAzimuthAngle={-Math.PI * 0.75}
        maxAzimuthAngle={Math.PI * 0.75}
      />
    </>
  );
};

export interface AvatarSceneProps {
  className?: string;
}

/**
 * AvatarScene — procedural three.js rig for the hero portrait.
 *
 * Loads `/models/avatar.glb` through `useGLTF` (preloaded, subpath-safe via
 * `assetUrl`, `vite base: './'`), drives a damped pointer look-at plus a
 * gentle sinusoidal breathing on the rig group, and frames it with a locked,
 * safely-constrained camera. Degrades to a blank rig when the asset is missing;
 * honours `prefers-reduced-motion` and the low device tier.
 */
export const AvatarScene: React.FC<AvatarSceneProps> = ({ className }) => {
  const tier = useDeviceTier();
  const low = tier === 'low';

  return (
    <div className={cn('pointer-events-auto relative h-[38dvh] w-full md:absolute md:inset-0', className)}>
      <AvatarErrorBoundary>
        <Canvas
          dpr={low ? 1 : [1, 2]}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
          camera={{ position: [0, 1.7, 3.1], fov: 34 }}
        >
          <Suspense fallback={<AvatarFallback />}>
            <AvatarRig />
          </Suspense>
        </Canvas>
      </AvatarErrorBoundary>
    </div>
  );
};
