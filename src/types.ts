export interface Project {
  id: string;
  title: string;
  client: string;
  category: 'video' | 'motion' | 'direction';
  tag: string;
  year: string;
  thumbnail: string;
  videoUrl?: string;
  description: string;
  softwareStack: string[];
  clientBrief: string;
  deliverables: string[];
  beforeGradeImg?: string;
  afterGradeImg?: string;
  metrics?: { label: string; value: string }[];
}

export interface VoiceTrack {
  id: string;
  title: string;
  category: 'Dramatic' | 'Commercial' | 'Tech & AI' | 'Gaming & Character';
  duration: string;
  waveform: number[];
  audioUrl?: string;
  pitchHz: number;
  description: string;
  script: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  deliverable: string;
}

export interface BriefFormData {
  clientName: string;
  clientEmail: string;
  companyName: string;
  services: string[];
  budget: string;
  timeline: string;
  projectOverview: string;
}
