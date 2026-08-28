import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a driver's full name including the middle name when present.
 * Normalizes casing to Proper Case regardless of how it was originally
 * entered (ALL CAPS, all lowercase, mixed).
 */
export function formatDriverName(
  first?: string | null,
  middle?: string | null,
  last?: string | null,
): string {
  return [first, middle, last]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .map(toProperCase)
    .join(' ');
}

/**
 * Title-cases a name part, handling hyphens and apostrophes
 * (e.g. "mary-jane o'brien" -> "Mary-Jane O'Brien").
 */
export function toProperCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase());
}

/**
 * Normalizes a CDL number for display — always uppercase, since letters
 * are sometimes entered lowercase on intake.
 */
export function formatCdlNumber(value?: string | null): string {
  return (value ?? '').trim().toUpperCase();
}

const US_STATE_ABBREVIATIONS: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  'district of columbia': 'DC', 'puerto rico': 'PR',
};

/**
 * Normalizes a driver's CDL state to its 2-letter abbreviation, regardless
 * of whether it was entered as a full name, abbreviation, or mixed case
 * (e.g. "Georgia" / "georgia" / "ga" -> "GA").
 */
export function formatState(value?: string | null): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  if (trimmed.length <= 2) return trimmed.toUpperCase();
  return US_STATE_ABBREVIATIONS[trimmed.toLowerCase()] ?? trimmed;
}
