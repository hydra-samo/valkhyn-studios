import type { Project } from '../types';

/**
 * Single source of truth for showcased work.
 *
 * NO FAKE CONTENT (workspace rule): PROJECTS stays empty until real, released
 * work exists. To add a project: append a Project object — media lives in
 * /public/work/<id>/ (poster.jpg, video.mp4). The site renders the designed
 * empty state while this list is empty; the horizontal chapter + takeover
 * activate automatically with the first entry.
 */
export const PROJECTS: Project[] = [];
