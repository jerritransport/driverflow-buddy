import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a driver's full name including the middle name when present.
 */
export function formatDriverName(
  first?: string | null,
  middle?: string | null,
  last?: string | null,
): string {
  return [first, middle, last]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');
}
