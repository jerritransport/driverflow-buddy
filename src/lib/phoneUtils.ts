/**
 * US Phone Number Utilities
 * Validates, normalizes, and formats US phone numbers.
 * Storage format: E.164 (+15550103456)
 * Display format: +1 (555) 010-3456
 */

const US_PHONE_REGEX = /^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

/** Validate that a string is a valid US phone number */
export function isValidUSPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) && US_PHONE_REGEX.test(phone);
}

/** Normalize a phone string to E.164 format: +15550103456 */
export function normalizeUSPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return phone; // Return as-is if can't normalize
}

/** Format a phone value as the user types: +1 (555) 010-3456 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  
  // Determine the 10 local digits
  let local: string;
  if (digits.length > 10 && digits.startsWith('1')) {
    local = digits.slice(1, 11);
  } else {
    local = digits.slice(0, 10);
  }

  if (local.length === 0) return '';
  if (local.length <= 3) return `+1 (${local}`;
  if (local.length <= 6) return `+1 (${local.slice(0, 3)}) ${local.slice(3)}`;
  return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
}

/** Format an E.164 stored phone for display: +1 (555) 010-3456 */
export function formatPhoneDisplay(phone: string | null): string {
  if (!phone) return 'N/A';
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
  if (local.length === 10) {
    return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return phone;
}
