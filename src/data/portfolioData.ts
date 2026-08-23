import { Project, VoiceTrack, ProcessStep } from '../types';

const IS_PREVIEW = import.meta.env.VITE_PREVIEW === 'true';

// Real case studies go here once ready. Swap the empty array below for Project
// objects (see src/types.ts). Best practices before going live:
//   - `client` should be the actual company that hired you. If it's a
//     self-directed piece, use "Spec / Concept Project" — never imply a
//     relationship with a real company unless it's true.
//   - `thumbnail`/`videoUrl`/`beforeGradeImg`/`afterGradeImg` should point at
//     your own reels (host the video files in /public or self-host them);
//     Unsplash/Google sample URLs are just scaffolding.
//   - `metrics` may be omitted entirely. Only add real numbers (views, ROAS,
//     festival nominations) you can stand behind.
export const PROJECTS: Project[] = IS_PREVIEW
  ? [
      { id: 'prev-1', title: 'NEON GENESIS — Brand Film', client: 'Aether Studios', category: 'direction', tag: 'Direction & Edit', year: '2025', thumbnail: '', videoUrl: '', description: 'Full-spectrum brand film combining kinetic motion graphics with cinematic voice-over narration.', softwareStack: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'], clientBrief: 'Create a high-impact brand film with integrated 3D elements and voice narration.', deliverables: ['4K Master', 'Social Cutdowns', 'Behind-the-Scenes'] },
      { id: 'prev-2', title: 'QUANTUM PULSE — Product Launch', client: 'NovaTech', category: 'video', tag: 'Video Edit', year: '2025', thumbnail: '', videoUrl: '', description: 'Fast-paced product launch video with precision cuts and seamless VFX integration.', softwareStack: ['Premiere Pro', 'DaVinci Resolve'], clientBrief: 'Edit a 60-second product reveal with dynamic pacing and brand consistency.', deliverables: ['4K Master', '15s Social Teaser', '30s Cut'] },
      { id: 'prev-3', title: 'VOID RUNNER — Game Trailer', client: 'Iron Cortex', category: 'motion', tag: 'Motion Design', year: '2024', thumbnail: '', videoUrl: '', description: 'High-energy game trailer with 3D environments, kinetic typography, and custom VFX.', softwareStack: ['After Effects', 'Cinema 4D', 'Blender'], clientBrief: 'Design motion graphics and 3D elements for a sci-fi game announcement trailer.', deliverables: ['Trailer 4K', 'Key Art Animation', 'Logo Reveal'] },
      { id: 'prev-4', title: 'SOLARIS DRIFT — Music Video', client: 'Indie Artist', category: 'video', tag: 'Edit & Grade', year: '2024', thumbnail: '', videoUrl: '', description: 'Atmospheric music video with cinematic color grading and rhythmic cut assembly.', softwareStack: ['DaVinci Resolve', 'Premiere Pro'], clientBrief: 'Edit and grade a performance-driven music video with moody cinematic tone.', deliverables: ['Music Video 4K', 'Lyric Video', 'Color Grade LUT'] },
      { id: 'prev-5', title: 'AEGIS SHIELD — Cybersecurity Ad', client: 'CipherNet', category: 'direction', tag: 'Full Production', year: '2025', thumbnail: '', videoUrl: '', description: 'End-to-end commercial production with voice-over, motion graphics, and cinematic edit.', softwareStack: ['Premiere Pro', 'After Effects', 'Pro Tools'], clientBrief: 'Produce a 30-second commercial combining live action, VFX, and voice-over.', deliverables: ['30s Commercial', '15s Cut', 'Voice-Over Clean'] },
      { id: 'prev-6', title: 'PHANTOM WIRE — Documentary', client: 'DeepLens Media', category: 'video', tag: 'Edit & Voice', year: '2024', thumbnail: '', videoUrl: '', description: 'Feature-length documentary edit with integrated voice-over narration and sound design.', softwareStack: ['Premiere Pro', 'Audition', 'Pro Tools'], clientBrief: 'Edit and narrate a 45-minute documentary on underground surveillance networks.', deliverables: ['Full Documentary', 'Trailer', 'Voice-Over Stems'] },
    ]
  : [];

// Add `audioUrl: '/audio/your-file.mp3'` (drop the file in /public/audio/) to
// any track below once a real recording exists. Tracks without audioUrl show
// a "sample coming soon" state on the site instead of faking playback.
export const VOICE_TRACKS: VoiceTrack[] = IS_PREVIEW
  ? [
      {
        id: 'voice-1',
        title: 'The Dark Sentinel',
        category: 'Dramatic',
        duration: '0:42',
        pitchHz: 110,
        waveform: [15, 35, 60, 85, 45, 95, 100, 70, 30, 50, 90, 80, 40, 20, 60, 85, 95, 75, 55, 30, 80, 100, 65, 40, 90, 70, 50, 20, 60, 80, 45, 30, 95, 85, 50, 25, 60, 40, 20, 10],
        description: 'Deep, resonant, gritty narrative voice for trailers, dark fantasy, and high-stakes cinematic storytelling.',
        script: 'When the last light fades beneath the ash, men do not look to kings for salvation. They look into the dark... and wait for the sentinel.'
      },
      {
        id: 'voice-2',
        title: 'Aura X1 Launch',
        category: 'Commercial',
        duration: '0:30',
        pitchHz: 140,
        waveform: [20, 40, 70, 90, 80, 60, 85, 95, 40, 60, 80, 70, 90, 100, 60, 30, 50, 70, 85, 95, 65, 45, 75, 85, 90, 60, 40, 70, 85, 50, 30, 60, 80, 40, 20, 50, 70, 30, 15, 10],
        description: 'Sleek, confident, modern tech commercial delivery with punchy cadence and premium authority.',
        script: 'Precision is not an option. It is the baseline. Introducing Aura X1: engineered without compromise, built for those who shape tomorrow.'
      },
      {
        id: 'voice-3',
        title: 'Quantum Neural Node',
        category: 'Tech & AI',
        duration: '0:38',
        pitchHz: 130,
        waveform: [10, 25, 45, 65, 85, 95, 80, 60, 40, 70, 90, 85, 75, 95, 100, 80, 50, 30, 60, 80, 90, 70, 50, 80, 95, 85, 60, 40, 70, 80, 60, 40, 20, 50, 75, 60, 35, 20, 10, 5],
        description: 'Smooth, articulate, visionary narrator for AI documentaries, corporate keynotes, and product deep-dives.',
        script: 'Trillions of calculations per microsecond. A synthetic matrix learning at the speed of light. Welcome to the era of cognitive computing.'
      },
      {
        id: 'voice-4',
        title: 'Warlord Kazimir',
        category: 'Gaming & Character',
        duration: '0:28',
        pitchHz: 95,
        waveform: [30, 60, 90, 100, 85, 95, 70, 80, 90, 100, 60, 40, 80, 95, 85, 90, 100, 70, 50, 85, 95, 80, 60, 90, 100, 75, 50, 80, 90, 60, 40, 70, 85, 50, 30, 60, 40, 20, 10, 5],
        description: 'Gravelly, menacing character voice with thunderous chest resonance and gravelly rasp.',
        script: 'You bring toothpicks to a siege, general? Break their gates! Leave not a single stone standing!'
      }
    ]
  : [];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'DIRECT BRIEFING',
    subtitle: 'Zero Middlemen',
    description: 'You speak directly with me—the editor, motion designer, and voice artist. We define visual tone, pace, and sound design goals in one initial session.',
    deliverable: 'Creative Outline & Styleboard'
  },
  {
    number: '02',
    title: 'RHYTHM & CUT ASSEMBLY',
    subtitle: 'The Video Head',
    description: 'Raw footage is trimmed to frame-perfect cuts. Beat matching, motion flow, and narrative pacing are locked into a strong rough cut.',
    deliverable: 'Lock-Cut Video Draft'
  },
  {
    number: '03',
    title: 'MOTION & VISUAL POLISH',
    subtitle: 'The Graphic Head',
    description: 'Kinetic titles, custom VFX overlays, 3D elements, and sleek color grading are integrated seamlessly into the timeline.',
    deliverable: 'Visual FX & Motion Pass'
  },
  {
    number: '04',
    title: 'VOCAL RESONANCE & SOUND',
    subtitle: 'The Audio Head',
    description: 'Voice-over narration is recorded in-house with studio microphone precision, paired with custom sound effects and master audio mixing.',
    deliverable: 'Master 24-bit Audio & Mix'
  },
  {
    number: '05',
    title: 'FINAL HYDRA DELIVERY',
    subtitle: 'Production Master',
    description: 'Exported in ultra-high resolution formats for Broadcast, Cinema, Web, and Socials. Multi-aspect ratio cutdowns included.',
    deliverable: 'Complete Master Asset Pack'
  }
];

export const COMPARISON_MATRIX = [
  {
    feature: 'Communication',
    agency: 'Account managers, email chains, delay',
    hydra: 'Direct 1-on-1 with Issam Eddine (Hydra Samo)'
  },
  {
    feature: 'Turnaround Speed',
    agency: '2-4 weeks with internal handoffs',
    hydra: '3-7 days with integrated unified workflow'
  },
  {
    feature: 'Creative Cohesion',
    agency: 'Fragmented (Editor vs Motion vs Audio)',
    hydra: '100% Unified (Video + Motion + Voice in sync)'
  },
  {
    feature: 'Cost Efficiency',
    agency: 'High studio overhead & manager markups',
    hydra: 'Lean direct pricing for agency-grade output'
  }
];
