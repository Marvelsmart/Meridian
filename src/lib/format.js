const CURRENCY = 'USD'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** $1,250,000.00 */
export function formatCurrency(value, { signed = false, showSymbol = true } = {}) {
  const amount = Number(value) || 0
  const formatted = currencyFormatter.format(Math.abs(amount))
  const withSymbol = showSymbol ? formatted : formatted.replace(/^[^\d]*/, '')
  if (!signed) return withSymbol
  const sign = amount < 0 ? '−' : '+'
  return `${sign}${withSymbol}`
}

/** $1.3M — used inside dense charts / axis labels */
export function formatCompact(value) {
  return `$${compactFormatter.format(Number(value) || 0)}`
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0)
}

/** 1,284,500.75 */
export function formatPlainAmount(value) {
  return numberFormatter.format(Number(value) || 0)
}

export function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}

/** 12 Mar 2026 */
export function formatDate(value, options) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

/** 12 Mar, 14:32 */
export function formatDateTime(value) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

/** 14:32 */
export function formatTime(value) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** "Just now" · "4h ago" · "3d ago" · date */
export function formatRelativeTime(value) {
  const date = toDate(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.round(days / 7)}w ago`
  return formatDate(date)
}

export function formatChartLabel(value) {
  return toDate(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

/** 2026-03-12 — used for <input type="date"> values */
export function toInputDate(value) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function startOfDay(value) {
  const date = toDate(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function endOfDay(value) {
  const date = toDate(value)
  date.setHours(23, 59, 59, 999)
  return date
}

export function addDays(value, days) {
  const date = toDate(value)
  date.setDate(date.getDate() + days)
  return date
}

/** 0123456789 → 012 345 6789 */
export function formatAccountNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3').trim()
}

/** 0123456789 → 012••••789 (keeps first/last 3) */
export function maskAccountNumber(value) {
  const digits = String(value ?? '')
  if (digits.length < 7) return '••••••••'
  return `${digits.slice(0, 3)}•••${digits.slice(-3)}`
}

/** 5399 1234 5678 4821 → •••• •••• •••• 4821 */
export function maskCardNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  const last4 = digits.slice(-4)
  return `•••• •••• •••• ${last4 || '••••'}`
}

/** 5399123456 784821 → 5399 1234 5678 4821 */
export function formatCardNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/** 0928 → 09/28 */
export function formatCardExpiry(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
}

export function formatMonthYear(value) {
  return toDate(value).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function initialsOf(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

export function formatPercent(value, { digits = 1 } = {}) {
  const rounded = Number(value) || 0
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : ''
  return `${sign}${Math.abs(rounded).toFixed(digits)}%`
}
