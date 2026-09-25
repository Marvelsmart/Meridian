/**
 * U.S. phone-number helpers.
 *
 * Country context for this demo bank is the United States (+1), so the signup
 * and profile fields accept every format a U.S. customer would realistically
 * type and normalize the value internally:
 *
 *   +1 (312) 555-0148 · (312) 555-0148 · 312-555-0148 · 3125550148
 *
 * Validation follows North American Numbering Plan rules: the area code and
 * exchange code cannot start with 0 or 1, and the number must contain 10
 * digits after the optional country code.
 */

export const DEFAULT_COUNTRY = { code: 'US', label: 'United States', dialCode: '+1' }

/** 10 digits: [2-9]XX [2-9]XX XXXX */
const US_NATIONAL_PATTERN = /^[2-9]\d{2}[2-9]\d{6}$/

export function phoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

/**
 * Drops the leading U.S. country code so '+13125550148' and '3125550148'
 * both collapse to '3125550148'.
 */
export function nationalDigits(value) {
  const digits = phoneDigits(value)
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

export function isValidUsPhone(value) {
  return US_NATIONAL_PATTERN.test(nationalDigits(value))
}

/** Progressive formatting used while the customer types: (312) 555-0148 */
export function formatUsPhone(value) {
  let digits = phoneDigits(value)
  if (digits.length > 10 && digits.startsWith('1')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (!digits) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** +1 (312) 555-0148 — display form once the number is complete. */
export function formatUsPhoneDisplay(value) {
  const national = nationalDigits(value)
  if (national.length !== 10) return String(value ?? '')
  return `${DEFAULT_COUNTRY.dialCode} (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`
}

/** E.164 (+13125550148) — what a backend would store. null when incomplete. */
export function toE164(value) {
  const national = nationalDigits(value)
  if (national.length !== 10) return null
  return `+1${national}`
}

/** Field-level error message, or null when the number is acceptable. */
export function phoneError(value) {
  const digits = phoneDigits(value)
  if (!digits) return 'Phone number is required'
  if (nationalDigits(value).length !== 10) return 'Enter a 10-digit U.S. phone number, for example (312) 555-0148'
  if (!isValidUsPhone(value)) return 'That area code is not valid — check the number and try again'
  return null
}
