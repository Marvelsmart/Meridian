export const STORAGE_KEYS = {
  auth: 'northstarbank.auth',
  db: 'northstarbank.db.v1',
  prefs: 'northstarbank.prefs',
}

export const BRAND = {
  name: 'Northstar Bank',
  tagline: 'Banking designed around your life.',
  supportEmail: 'support@northstarbank-demo.com',
  supportPhone: '+1 (800) 555-0136',
  address: '2400 Harbor Avenue, Seattle, WA',
}

export const ACCOUNT_TYPES = {
  savings: 'Savings',
  current: 'Current',
  domiciliary: 'Domiciliary',
}

export const TRANSACTION_STATUS = {
  successful: 'successful',
  pending: 'pending',
  failed: 'failed',
  reversed: 'reversed',
}

export const STATUS_META = {
  successful: {
    label: 'Successful',
    className: 'bg-success-50 text-success-700 ring-success-100',
    dot: 'bg-success-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning-50 text-warning-600 ring-warning-100',
    dot: 'bg-warning-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-danger-50 text-danger-700 ring-danger-100',
    dot: 'bg-danger-500',
  },
  reversed: {
    label: 'Reversed',
    className: 'bg-ink-100 text-ink-600 ring-ink-200',
    dot: 'bg-ink-400',
  },
}

export const CATEGORY_META = {
  transfer: { label: 'Transfers', icon: 'ArrowLeftRight', tone: 'brand' },
  income: { label: 'Income', icon: 'TrendingUp', tone: 'success' },
  bills: { label: 'Bills', icon: 'ReceiptText', tone: 'brand' },
  card: { label: 'Card payments', icon: 'CreditCard', tone: 'ink' },
  withdrawal: { label: 'Withdrawals', icon: 'Banknote', tone: 'ink' },
  savings: { label: 'Savings', icon: 'PiggyBank', tone: 'success' },
  refund: { label: 'Refunds', icon: 'RotateCcw', tone: 'success' },
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

export const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

export const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 3 months', days: 90 },
  { value: '180d', label: 'Last 6 months', days: 180 },
  { value: 'all', label: 'All time', days: null },
  { value: 'custom', label: 'Custom range', days: null },
]

export const TRANSACTION_CHANNELS = {
  mobile: 'Mobile app',
  web: 'Web',
  atm: 'ATM',
  pos: 'POS terminal',
  direct_debit: 'Direct debit',
  online: 'Online banking',
}

/**
 * Customer-facing transaction types, derived from the category + direction +
 * channel that every transaction already carries. Deriving (instead of storing
 * a label per row) means a new transaction type can never break the details
 * screen — an unknown combination simply falls back to a readable default.
 */
const TRANSACTION_TYPE_MAP = {
  'card': { credit: 'Card Refund', debit: 'Card Purchase' },
  'transfer': { credit: 'ACH Credit', debit: 'ACH Debit' },
  'bills': { credit: 'Bill Refund', debit: 'Bill Payment' },
  'withdrawal': { credit: 'ATM Deposit', debit: 'ATM Withdrawal' },
  'savings': { credit: 'Savings Withdrawal', debit: 'Savings Transfer' },
  'income': { credit: 'Direct Deposit', debit: 'Income Adjustment' },
  'refund': { credit: 'Refund', debit: 'Reversal' },
}

export function transactionTypeLabel(transaction) {
  if (!transaction) return 'Transaction'
  const type = transaction.type === 'credit' ? 'credit' : 'debit'
  if (transaction.category === 'withdrawal') return type === 'debit' ? 'ATM Withdrawal' : 'ATM Deposit'
  if (transaction.category === 'card') return type === 'debit' ? 'Card Purchase' : 'Card Refund'
  const mapped = TRANSACTION_TYPE_MAP[transaction.category]
  if (mapped) return mapped[type]
  return type === 'credit' ? 'Credit' : 'Debit'
}

/** How the money moved: card, rail or channel. */
export function paymentMethodLabel(transaction) {
  if (!transaction) return '—'
  if (transaction.cardId) return 'Debit Card'
  if (transaction.category === 'withdrawal' || transaction.channel === 'atm') return 'ATM'
  if (transaction.channel === 'pos') return 'Debit Card'
  if (transaction.channel === 'direct_debit') return 'ACH / Direct debit'
  if (transaction.category === 'transfer') return 'Bank transfer (ACH)'
  if (transaction.category === 'bills') return 'Online bill pay'
  return TRANSACTION_CHANNELS[transaction.channel] ?? 'Bank transfer'
}

/** Status wording used on receipts and detail screens. */
export const TRANSACTION_STATUS_LABELS = {
  successful: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
  reversed: 'Reversed',
}

export function transactionStatusLabel(status) {
  return TRANSACTION_STATUS_LABELS[status] ?? (status ? String(status) : 'Unknown')
}

