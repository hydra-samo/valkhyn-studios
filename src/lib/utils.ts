import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const assetUrl = (p: string): string =>
  (import.meta.env.BASE_URL || '/') + p.replace(/^\//, '');
