/** U.S. banks and digital payment rails used across transfers and beneficiaries. */
export const BANKS = [
  { code: '021000021', name: 'JPMorgan Chase', short: 'Chase' },
  { code: '026013673', name: 'Bank of America', short: 'Bank of America' },
  { code: '211274450', name: 'Wells Fargo', short: 'Wells Fargo' },
  { code: '122105155', name: 'Citibank', short: 'Citibank' },
  { code: '111000025', name: 'Bank of the West', short: 'Bank of the West' },
  { code: '325081403', name: 'Capital One', short: 'Capital One' },
  { code: '122242607', name: 'U.S. Bank', short: 'U.S. Bank' },
  { code: '091000019', name: 'PNC Bank', short: 'PNC' },
  { code: '151023121', name: 'Discover Bank', short: 'Discover' },
  { code: '000014', name: 'Northstar Savings Vault', short: 'Northstar Vault' },
]

export const BANK_BY_CODE = BANKS.reduce((map, bank) => {
  map[bank.code] = bank
  return map
}, {})

export function bankName(code) {
  return BANK_BY_CODE[code]?.name ?? 'Bank transfer'
}

/** Deterministic avatar tone per name — keeps list colours stable across renders. */
const AVATAR_TONES = [
  'bg-brand-50 text-brand-700',
  'bg-success-50 text-success-700',
  'bg-warning-50 text-warning-600',
  'bg-danger-50 text-danger-700',
  'bg-ink-100 text-ink-700',
]

export function avatarTone(seed = '') {
  const sum = String(seed)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)
  return AVATAR_TONES[sum % AVATAR_TONES.length]
}
