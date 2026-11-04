export interface Discipline {
  id: 'video' | 'motion' | 'voice';
  tools: string[];
}

/** Copy lives in `i18n/translations.ts` under `disc.<id>.*`. */
export const DISCIPLINES: Discipline[] = [
  { id: 'video', tools: ['Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro'] },
  { id: 'motion', tools: ['After Effects', 'Cinema 4D', 'Blender'] },
  { id: 'voice', tools: ['Shure SM7B', 'Neumann U87', 'Pro Tools'] },
];

/** Copy lives in `i18n/translations.ts` under `process.<index>.*`. */
export const PROCESS_STEPS = [{ index: '1' }, { index: '2' }, { index: '3' }, { index: '4' }, { index: '5' }];

/** Single source of truth for the contact address. */
export const EMAIL = 'hello@valkyhyn.com';
