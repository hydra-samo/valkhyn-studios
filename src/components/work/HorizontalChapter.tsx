import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Project } from '../../types';
import { ease } from '../../lib/motionTokens';
import { useCoarsePointer } from '../../hooks/useCoarsePointer';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalChapterProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

/**
 * Pinned horizontal chapter — viewport pins while the project track travels
 * sideways with scroll. Activates only when projects exist and motion is
 * welcome; otherwise falls back to a vertical stack (or the caller's designed
 * empty state).
 */
export function HorizontalChapter({ projects, onOpen }: HorizontalChapterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isCoarse = useCoarsePointer();

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pinned = projects.length > 1 && !reduceMotion && !isCoarse;

  useEffect(() => {
    if (!pinned || !sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const getMaxX = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -getMaxX(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: () => `+=${getMaxX()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, sectionRef);

    // Refresh after fonts/images settle
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [pinned, projects.length]);

  if (!pinned) {
    // Vertical fallback — same cards, stacked
    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={onOpen} tall />
        ))}
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative h-screen overflow-hidden">
      <div
        ref={trackRef}
        className="flex h-full items-center gap-6 lg:gap-10 pl-2 pr-[12vw] will-change-transform"
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={onOpen} />
        ))}

        {/* Chapter end cap */}
        <div className="shrink-0 w-[40vw] flex items-center justify-center" aria-hidden="true">
          <span className="heading-cinematic text-white/[0.04] text-[10vw] select-none">FIN</span>
        </div>
      </div>
    </div>
  );
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  onOpen,
  tall = false,
}: {
  project: Project;
  onOpen: (p: Project) => void;
  tall?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(project)}
      data-cursor="card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, ease: ease.cinematic }}
      className={`group relative shrink-0 w-[82vw] sm:w-[60vw] lg:w-[44vw] ${
        tall ? 'aspect-[16/10]' : 'h-[62vh]'
      } rounded-3xl overflow-hidden text-left border border-white/[0.06] bg-canvas-card glass-hover`}
    >
      {/* Poster */}
      {project.thumbnail ? (
        <img
          src={project.thumbnail}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:opacity-90 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.05] to-transparent" />
      )}

      {/* Meta overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
        <span className="label-cinematic block mb-2">{project.tag}</span>
        <h3 className="font-display font-bold uppercase tracking-tight text-xl sm:text-2xl lg:text-3xl text-white leading-tight">
          {project.title}
        </h3>
        <p className="mt-1 text-xs text-white/40">
          {project.client} · {project.year}
        </p>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-accent/[0.04] pointer-events-none" />
    </motion.button>
  );
});
