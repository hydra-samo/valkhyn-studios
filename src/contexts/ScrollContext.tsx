import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TOTAL_FRAMES = 300;

interface ScrollState {
  progress: number;
  frame: number;
}

const ScrollContext = createContext<ScrollState>({ progress: 0, frame: 0 });

export function useScrollFrame(): ScrollState {
  return useContext(ScrollContext);
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScrollState>({ progress: 0, frame: 0 });
  const rafRef = useRef(0);
  const prevFrameRef = useRef(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;

      // Smooth frame mapping — interpolate between frames to avoid snapping
      const rawFrame = progress * (TOTAL_FRAMES - 1);
      const prevFrame = prevFrameRef.current;
      // Lerp towards target for smooth transitions
      const smoothFrame = prevFrame + (rawFrame - prevFrame) * 0.35;
      const frame = Math.round(Math.min(TOTAL_FRAMES - 1, Math.max(0, smoothFrame)));
      prevFrameRef.current = smoothFrame;

      setState({ progress, frame });
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  return (
    <ScrollContext.Provider value={state}>
      {children}
    </ScrollContext.Provider>
  );
}
