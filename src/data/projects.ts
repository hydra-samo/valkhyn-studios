import type { Project } from '../types';
import raw from './projects.json';

/**
 * Single source of truth for showcased work.
 * Edited live by the Studio dashboard (/dashboard) via the local API —
 * every write hot-reloads the site. NO FAKE CONTENT: stays empty until
 * real, released work exists.
 */
export const PROJECTS = raw as Project[];
