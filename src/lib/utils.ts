import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes, letting later utilities win over conflicting ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Runtime asset path that respects Vite base (works locally AND under GitHub Pages subpath). */
export const assetUrl = (p: string): string =>
  (import.meta.env.BASE_URL || '/') + p.replace(/^\//, '');
