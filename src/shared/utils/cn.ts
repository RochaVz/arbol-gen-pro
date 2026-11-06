import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * This function ensures that Tailwind classes are properly merged
 * and that later classes override earlier ones
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
