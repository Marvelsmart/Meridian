import {
  getState,
  patchState,
  insertTransaction,
  updateTransaction,
  updateAccount,
  saveBeneficiary,
  deleteBeneficiary,
  saveCard,
  saveNotifications,
  updateUser,
  updateSecurity,
  setPassword,
  removeSession,
  makeReference,
  nextEntityId,
  nextTransactionId,
  resetDatabase,
} from './db'
import { filterTransactions, sumsFor, statementTotals, inRange } from './analytics'
import { DEMO_CREDENTIALS, PROVIDER_BY_ID } from '@/data'
import { readStorage, writeStorage, removeStorage } from './storage'
import { STORAGE_KEYS } from './constants'
import { toInputDate } from './format'

/**
 * ------------------------------------------------------------------
 * Mock API layer — the ONLY place the UI talks to "the backend".
 * ------------------------------------------------------------------
 * Every function is async, validates its input, and returns plain
 * JSON-serialisable objects, so swapping a body for `fetch('/api/...')`
 * is a local, mechanical change.
 *
 * Add `VITE_MOCK_FAILURES=0.08` to a `.env` file to randomly surface the
 * error states that are wired throughout the app.
 */

const FAILURE_RATE = Number(import.meta.env.VITE_MOCK_FAILURES ?? 0)
export const LATENCY = { fast: 180, normal: 420, slow: 900 }

export class ApiError extends Error {
  constructor(message, { code = 'api_error', fields = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.fields = fields
  }
}

function settle(payload, ms = LATENCY.normal, { rejectRate = FAILURE_RATE } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (rejectRate > 0 && Math.random() < rejectRate) {
        reject(new ApiError('Something went wrong on our end. Please try again.', { code: 'upstream_error' }))
        return
      }
      resolve(payload)
    }, ms)
  })
}

function requireFields(values, rules) {
  const fields = {}
  Object.entries(rules).forEach(([field, rule]) => {
    const value = String(values?.[field] ?? '').trim()
    if (rule.required && !value) fields[field] = `${rule.label} is required`
    else if (value && rule.min && value.length < rule.min) fields[field] = `${rule.label} is too short`
    else if (value && rule.pattern && !rule.pattern.test(value)) {
      fields[field] = rule.message ?? `Enter a valid ${rule.label.toLowerCase()}`
    }
  })
  if (Object.keys(fields).length) {
    throw new ApiError('Please correct the highlighted fields.', { code: 'validation_error', fields })
  }
}

/* ------------------------------------------------------------------ */
/* Session / auth                                                      */
/* ------------------------------------------------------------------ */

export async function login({ email, password }) {
  const state = getState()
  const fields = {}
  if (!String(email ?? '').trim()) fields.email = 'Email is required'
  if (!String(password ?? '')) fields.password = 'Password is required'
  if (Object.keys(fields).length) {
    throw new ApiError('Enter your email and password.', { code: 'validation_error', fields })
  }
  const matches =
    String(email).trim().toLowerCase() === state.user.email.toLowerCase() && password === state.password
  if (!matches) {
    throw new ApiError('Incorrect email or password. Please try again.', { code: 'invalid_credentials' })
  }
  return settle(
    {
      token: `mdn_${Math.random().toString(36).slice(2, 12)}`,
      issuedAt: new Date().toISOString(),
      user: state.user,
    },
    LATENCY.slow,
  )
}

export async function register(payload) {
  requireFields(payload, {
    firstName: { required: true, label: 'First name', min: 2 },
    lastName: { required: true, label: 'Last name', min: 2 },
    email: {
      required: true,
      label: 'Email',
      pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
      message: 'Enter a valid email address',
    },
    phone: {
      required: true,
      label: 'Phone number',
      pattern: /^(\+?234\d{10}|0\d{10})$/,
      message: 'Enter a valid U.S. phone number',
    },
    password: { required: true, label: 'Password', min: 8 },
  })

  // A real backend would create a customer record. The mock personalises the
  // demo profile instead, so the whole app immediately reflects the new details.
  const state = patchState({
    user: {
      ...getState().user,
      firstName: String(payload.firstName).trim(),
      lastName: String(payload.lastName).trim(),
      email: String(payload.email).trim().toLowerCase(),
      phone: String(payload.phone).trim(),
    },
  })
  return settle(
    {
      token: `mdn_${Math.random().toString(36).slice(2, 12)}`,
      issuedAt: new Date().toISOString(),
      user: state.user,
      needsVerification: true,
    },
    LATENCY.slow,
  )
}

export async function requestPasswordReset(email) {
  if (!String(email ?? '').trim()) {
    throw new ApiError('Enter the email on your account.', {
      code: 'validation_error',
      fields: { email: 'Email is required' },
    })
  }
  await settle(null, LATENCY.slow)
  // The code is returned here only because there is no email service in this phase.
  return { email: String(email).trim(), expiresInMinutes: 15, demoCode: '284916' }
}

export async function resetPassword({ code, password, confirmPassword }) {
  const fields = {}
  if (!String(code ?? '').trim()) fields.code = 'Enter the 6-digit reset code'
  if (!password) fields.password = 'Enter a new password'
  else if (String(password).length < 8) fields.password = 'Use at least 8 characters'
  if (password !== confirmPassword) fields.confirmPassword = 'Passwords do not match'
  if (Object.keys(fields).length) {
    throw new ApiError('Please correct the highlighted fields.', { code: 'validation_error', fields })
  }
  await settle(null, LATENCY.slow)
  setPassword(String(password))
  return { success: true }
}

export async function logout() {
  return settle({ success: true }, LATENCY.fast)
}

export function currentSession() {
  return readStorage(STORAGE_KEYS.auth, null)
}

export function persistSession(session) {
  if (session) writeStorage(STORAGE_KEYS.auth, session)
  else removeStorage(STORAGE_KEYS.auth)
}

export function resetDemoData() {
  resetDatabase()
  removeStorage(STORAGE_KEYS.prefs)
  return true
}

export const demoCredentials = DEMO_CREDENTIALS
export const apiBaseUrl = 'mock://local'

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function getAppData() {
  const state = getState()
  return settle(
    {
      user: state.user,
      accounts: state.accounts,
      transactions: state.transactions,
      beneficiaries: state.beneficiaries,
      cards: state.cards,
      notifications: state.notifications,
      sessions: state.sessions,
    },
    LATENCY.slow,
  )
}

export async function fetchTransactions(params = {}) {
  const { page = 1, pageSize = 10, accountId = 'all', ...filters } = params
  const scoped = filterTransactions(getState().transactions, { ...filters, accountId })
  const total = scoped.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize
  return settle(
    {
      items: scoped.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      pageCount,
      summary: sumsFor(scoped),
    },
    LATENCY.normal,
  )
}

export async function fetchTransaction(id) {
  const txn = getState().transactions.find((item) => item.id === id)
  if (!txn) throw new ApiError('We could not find that transaction.', { code: 'not_found' })
  return settle(txn, LATENCY.normal)
}

export async function fetchRecentTransactions(limit = 5, accountId = 'all') {
  const items = getState().transactions
    .filter((txn) => accountId === 'all' || txn.accountId === accountId)
    .slice(0, limit)
  return settle(items, LATENCY.normal)
}

export async function fetchDashboardSummary({ accountId, days = 30 } = {}) {
  const state = getState()
  const account = state.accounts.find((item) => item.id === accountId) ?? state.accounts.find((a) => a.primary) ?? state.accounts[0]
  const since = new Date()
  since.setDate(since.getDate() - days)
  const window = inRange(
    state.transactions.filter((txn) => txn.accountId === account.id),
    since,
    new Date(),
  )
  const previousSince = new Date()
  previousSince.setDate(previousSince.getDate() - days * 2)
  const previousWindow = inRange(
    state.transactions.filter((txn) => txn.accountId === account.id),
    previousSince,
    since,
  )
  return settle(
    {
      account,
      windowDays: days,
      summary: sumsFor(window),
      previous: sumsFor(previousWindow),
      pending: window.filter((txn) => txn.status === 'pending').length,
      unreadNotifications: state.notifications.filter((item) => !item.read).length,
      recent: state.transactions.filter((txn) => txn.accountId === account.id).slice(0, 6),
      lastActiveAt: state.transactions[0]?.date ?? null,
    },
    LATENCY.normal,
  )
}

export async function fetchNotifications() {
  return settle(getState().notifications, LATENCY.fast)
}

export async function fetchStatement({ accountId, from, to }) {
  const state = getState()
  const account = state.accounts.find((item) => item.id === accountId) ?? state.accounts[0]
  const scoped = inRange(
    state.transactions.filter((txn) => txn.accountId === account.id),
    from,
    to,
  ).sort((a, b) => new Date(a.date) - new Date(b.date))

  if (!scoped.length) {
    throw new ApiError('No transactions were found for the selected period.', { code: 'empty_statement' })
  }
  return settle(
    {
      account,
      period: { from: toInputDate(from), to: toInputDate(to) },
      generatedAt: new Date().toISOString(),
      transactions: scoped,
      totals: statementTotals(scoped),
    },
    LATENCY.slow,
  )
}

/**
 * Account-name resolution for the mock transfer flow. The result is derived
 * deterministically from the account number so the same input resolves to the
 * same believable counterpart without a real backend dependency.
 */
export async function resolveAccountName({ accountNumber, bankCode }) {
  const digits = String(accountNumber ?? '').replace(/\D/g, '')
  if (digits.length !== 10) {
    throw new ApiError('Account number must be 10 digits.', {
      code: 'validation_error',
      fields: { accountNumber: 'Enter a valid 10-digit account number' },
    })
  }
  if (!bankCode) {
    throw new ApiError('Select a bank to continue.', {
      code: 'validation_error',
      fields: { bankCode: 'Please choose a bank' },
    })
  }

  const stored = getState().beneficiaries.find((item) => item.accountNumber === digits)
  if (stored) return settle({ name: stored.name, bank: stored.bank, accountNumber: digits }, LATENCY.slow)

  const FIRST = ['Ava', 'Mason', 'Olivia', 'Noah', 'Emma', 'Liam', 'Sophia', 'Lucas', 'Harper', 'Ethan', 'Isabella', 'Milo']
  const LAST = ['Walker', 'Nguyen', 'Brown', 'Patel', 'Davis', 'Martinez', 'Kim', 'Baker', 'Rivera', 'Allen', 'Powell', 'Turner']
  const seed = digits.split('').reduce((total, digit) => total + Number(digit), Number(bankCode.slice(-2)) || 0)
  const name = `${FIRST[seed % FIRST.length]} ${LAST[(seed * 3) % LAST.length]}`

  if (digits.startsWith('000')) {
    throw new ApiError('This account could not be resolved. Check the number and try again.', {
      code: 'name_enquiry_failed',
      fields: { accountNumber: 'Account not found at this bank' },
    })
  }
  return settle({ name, bank: null, accountNumber: digits }, LATENCY.slow)
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

const TRANSACTION_PREFIX = {
  transfer: 'TRF',
  bills: 'BIL',
  withdrawal: 'ATM',
  income: 'DEP',
}

function accountById(accountId) {
  const state = getState()
  return state.accounts.find((item) => item.id === accountId) ?? state.accounts[0]
}

function pushNotification({ category, title, body, actionLabel = null, actionPath = null, important = false }) {
  const notification = {
    id: nextEntityId('ntf', 'notifications'),
    category,
    title,
    body,
    read: false,
    important,
    actionLabel,
    actionPath,
    createdAt: new Date().toISOString(),
  }
  saveNotifications([notification, ...getState().notifications])
  return notification
}

function recordMovement({
  accountId,
  type,
  category,
  description,
  amount,
  fee = 0,
  channel = 'mobile',
  counterparty = null,
  narration = null,
  meta = null,
  cardId = null,
  status = 'successful',
}) {
  const account = accountById(accountId)
  const signedAmount = type === 'credit' ? amount - fee : -(amount + fee)
  const transaction = {
    id: nextTransactionId(),
    reference: makeReference(TRANSACTION_PREFIX[category] ?? 'MDN'),
    type,
    status,
    category,
    description,
    counterparty,
    amount,
    fee,
    channel,
    narration,
    cardId,
    meta,
    accountId: account.id,
    date: new Date().toISOString(),
    signedAmount,
    balanceAfter: Number((account.balance + (status === 'failed' ? 0 : signedAmount)).toFixed(2)),
  }
  insertTransaction(transaction)
  const updatedAccount =
    status === 'failed' ? account : updateAccount(account.id, { delta: signedAmount })
  return { transaction, account: updatedAccount ?? account }
}

function assertAmount(amount, { available, singleLimit, label = 'Amount', field = 'amount' }) {
  const value = Number(amount)
  const fields = {}
  if (!value) fields[field] = `${label} is required`
  else if (value <= 0) fields[field] = `${label} must be greater than zero`
  else if (singleLimit && value > singleLimit) fields[field] = `Above your per-transaction limit of ₦${singleLimit.toLocaleString('en-NG')}`
  else if (available && value > available) fields[field] = 'Insufficient available balance'
  if (Object.keys(fields).length) {
    throw new ApiError('Please review the amount and try again.', { code: 'validation_error', fields })
  }
  return value
}

export async function createTransfer(payload) {
  const account = accountById(payload.accountId)
  const recipient = payload.recipient ?? {}
  const fields = {}
  if (!account) fields.accountId = 'Select an account to debit'
  if (!recipient.name) fields.recipient = 'Resolve the recipient account first'
  if (!recipient.accountNumber) fields.accountNumber = 'Recipient account number is required'
  if (Object.keys(fields).length) {
    throw new ApiError('We could not process this transfer.', { code: 'validation_error', fields })
  }

  const amount = assertAmount(payload.amount, {
    available: account.available,
    singleLimit: account.limits?.singleTransfer,
  })
  const fee = amount <= 5000 ? 10 : amount <= 50000 ? 25 : 50

  await settle(null, LATENCY.slow)

  const { transaction, account: updatedAccount } = recordMovement({
    accountId: account.id,
    type: 'debit',
    category: 'transfer',
    description: `Transfer to ${recipient.name}`,
    amount,
    fee,
    channel: 'web',
    counterparty: {
      name: recipient.name,
      bank: recipient.bank ?? 'Northstar Bank',
      accountNumber: recipient.accountNumber,
      kind: 'person',
    },
    narration: payload.narration || payload.description || 'Transfer',
    meta: { bankCode: recipient.bankCode ?? null, beneficiaryId: payload.beneficiaryId ?? null },
  })

  pushNotification({
    category: 'transaction',
    title: 'Transfer completed',
    body: `Your transfer of ₦${amount.toLocaleString('en-NG')} to ${recipient.name} was successful.`,
    actionLabel: 'View transaction',
    actionPath: `/app/transactions/${transaction.id}`,
    important: true,
  })

  return { transaction, account: updatedAccount }
}

export async function createBillPayment(payload) {
  const account = accountById(payload.accountId)
  const provider = PROVIDER_BY_ID[payload.providerId]
  if (!provider) {
    throw new ApiError('Choose a biller to continue.', {
      code: 'validation_error',
      fields: { providerId: 'Select a provider' },
    })
  }
  const fields = {}
  if (!String(payload.customerRef ?? '').trim()) fields.customerRef = `${provider.customerLabel} is required`
  if (Object.keys(fields).length) {
    throw new ApiError('Please complete the customer information.', { code: 'validation_error', fields })
  }

  const amount = assertAmount(payload.amount, {
    available: account.available,
    singleLimit: account.limits?.singleTransfer,
  })
  const fee = provider.fee ?? 0

  await settle(null, LATENCY.slow)

  const { transaction, account: updatedAccount } = recordMovement({
    accountId: account.id,
    type: 'debit',
    category: 'bills',
    description: `${provider.short} bill payment`,
    amount,
    fee,
    channel: 'web',
    counterparty: { name: provider.name, kind: 'bill' },
    narration: `${provider.name} bill payment`,
    meta: {
      provider: provider.name,
      providerId: provider.id,
      customerRef: String(payload.customerRef).trim(),
      meterType: payload.meterType ?? null,
      token: provider.category === 'electricity' ? makeReference('TOK').replace('TOK-', '') : null,
    },
  })

  const token = transaction.meta?.token
  pushNotification({
    category: 'transaction',
    title: 'Bill payment successful',
    body: token
      ? `${provider.short} payment of ₦${amount.toLocaleString('en-NG')} confirmed. Token: ${token}.`
      : `${provider.name} payment of ₦${amount.toLocaleString('en-NG')} for ${payload.customerRef} was successful.`,
    actionLabel: 'View transaction',
    actionPath: `/app/transactions/${transaction.id}`,
  })

  return { transaction, account: updatedAccount, token }
}

export async function createWithdrawal(payload) {
  const account = accountById(payload.accountId)
  const amount = assertAmount(payload.amount, {
    available: account.available,
    singleLimit: account.limits?.singleTransfer,
  })
  const destination = payload.destination ?? 'Northstar ATM'

  await settle(null, LATENCY.slow)

  const { transaction, account: updatedAccount } = recordMovement({
    accountId: account.id,
    type: 'debit',
    category: 'withdrawal',
    description: `ATM withdrawal — ${destination}`,
    amount,
    fee: payload.fee ?? 105,
    channel: 'atm',
    counterparty: { name: 'Northstar ATM', kind: 'atm' },
    narration: 'Cash withdrawal',
  })

  pushNotification({
    category: 'transaction',
    title: 'Withdrawal processed',
    body: `₦${amount.toLocaleString('en-NG')} withdrawal was approved at ${destination}.`,
    actionLabel: 'View transaction',
    actionPath: `/app/transactions/${transaction.id}`,
  })

  return { transaction, account: updatedAccount }
}

export async function createDeposit(payload) {
  const account = accountById(payload.accountId)
  const amount = Number(payload.amount)
  const fields = {}
  if (!amount || amount <= 0) fields.amount = 'Amount is required'
  else if (amount < 500) fields.amount = 'Minimum top-up is ₦500'
  if (Object.keys(fields).length) {
    throw new ApiError('Please correct the highlighted fields.', { code: 'validation_error', fields })
  }

  await settle(null, LATENCY.slow)

  const method = payload.method === 'card' ? 'Debit card' : 'Bank transfer'
  const { transaction, account: updatedAccount } = recordMovement({
    accountId: account.id,
    type: 'credit',
    category: 'income',
    description: `Wallet top-up — ${method}`,
    amount,
    fee: 0,
    channel: payload.method === 'card' ? 'web' : 'direct_debit',
    counterparty: { name: method, kind: 'funding' },
    narration: 'Inbound funding',
    meta: { method: payload.method ?? 'transfer' },
  })

  pushNotification({
    category: 'transaction',
    title: 'Money added',
    body: `₦${amount.toLocaleString('en-NG')} was added to your ${account.name} via ${method}.`,
    actionLabel: 'View transaction',
    actionPath: `/app/transactions/${transaction.id}`,
  })

  return { transaction, account: updatedAccount }
}

/* ------------------------------------------------------------------ */
/* Beneficiaries                                                       */
/* ------------------------------------------------------------------ */

const ACCOUNT_NUMBER_PATTERN = /^\d{10}$/

export async function createBeneficiary(payload) {
  requireFields(payload, {
    name: { required: true, label: 'Account name', min: 3 },
    bankCode: { required: true, label: 'Bank' },
    accountNumber: {
      required: true,
      label: 'Account number',
      pattern: ACCOUNT_NUMBER_PATTERN,
      message: 'Account number must be 10 digits',
    },
  })

  const duplicate = getState().beneficiaries.find(
    (item) => item.accountNumber === String(payload.accountNumber).trim() && item.bankCode === payload.bankCode,
  )
  if (duplicate) {
    throw new ApiError(`${duplicate.name} is already saved for this bank.`, {
      code: 'duplicate_beneficiary',
      fields: { accountNumber: 'This account is already in your beneficiaries' },
    })
  }

  await settle(null, LATENCY.slow)

  const beneficiary = {
    id: nextEntityId('ben', 'beneficiaries'),
    name: String(payload.name).trim(),
    nickname: payload.nickname ? String(payload.nickname).trim() : null,
    bank: payload.bank,
    bankCode: payload.bankCode,
    accountNumber: String(payload.accountNumber).trim(),
    email: payload.email ? String(payload.email).trim() : null,
    phone: payload.phone ? String(payload.phone).trim() : null,
    type: payload.bankCode === '000014' ? 'northstar' : 'bank',
    favourite: Boolean(payload.favourite),
    lastPaidAt: null,
    addedOn: new Date().toISOString(),
    note: payload.note ? String(payload.note).trim() : null,
  }

  saveBeneficiary(beneficiary)
  pushNotification({
    category: 'account',
    title: 'Beneficiary added',
    body: `${beneficiary.name} (${beneficiary.bank}) was added to your beneficiaries.`,
    actionLabel: 'Manage beneficiaries',
    actionPath: '/app/beneficiaries',
  })
  return beneficiary
}

export async function updateBeneficiary(id, payload) {
  requireFields(payload, {
    name: { required: true, label: 'Account name', min: 3 },
    bankCode: { required: true, label: 'Bank' },
    accountNumber: {
      required: true,
      label: 'Account number',
      pattern: ACCOUNT_NUMBER_PATTERN,
      message: 'Account number must be 10 digits',
    },
  })
  const existing = getState().beneficiaries.find((item) => item.id === id)
  if (!existing) throw new ApiError('That beneficiary no longer exists.', { code: 'not_found' })

  await settle(null, LATENCY.fast)
  const updated = {
    ...existing,
    name: String(payload.name).trim(),
    nickname: payload.nickname ? String(payload.nickname).trim() : null,
    bank: payload.bank,
    bankCode: payload.bankCode,
    accountNumber: String(payload.accountNumber).trim(),
    email: payload.email ? String(payload.email).trim() : null,
    phone: payload.phone ? String(payload.phone).trim() : null,
    note: payload.note ? String(payload.note).trim() : null,
    favourite: Boolean(payload.favourite),
  }
  saveBeneficiary(updated)
  return updated
}

export async function removeBeneficiary(id) {
  const existing = getState().beneficiaries.find((item) => item.id === id)
  if (!existing) throw new ApiError('That beneficiary no longer exists.', { code: 'not_found' })
  await settle(null, LATENCY.fast)
  deleteBeneficiary(id)
  return { id }
}

export async function toggleBeneficiaryFavourite(id) {
  const existing = getState().beneficiaries.find((item) => item.id === id)
  if (!existing) throw new ApiError('That beneficiary no longer exists.', { code: 'not_found' })
  const updated = { ...existing, favourite: !existing.favourite }
  saveBeneficiary(updated)
  return settle(updated, LATENCY.fast)
}

/* ------------------------------------------------------------------ */
/* Cards                                                              */
/* ------------------------------------------------------------------ */

function generateCardNumber(brand) {
  const prefix = brand === 'Visa' ? '5061' : '5399'
  let rest = ''
  for (let i = 0; i < 12; i += 1) rest += Math.floor(Math.random() * 10)
  const digits = `${prefix}${rest}`
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function generateExpiry(yearsAhead = 3) {
  const date = new Date()
  date.setFullYear(date.getFullYear() + yearsAhead)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const year = `${date.getFullYear()}`.slice(-2)
  return `${month}/${year}`
}

export async function toggleCardFreeze(cardId) {
  const card = getState().cards.find((item) => item.id === cardId)
  if (!card) throw new ApiError('That card is unavailable.', { code: 'not_found' })
  if (card.status === 'expired') {
    throw new ApiError('Expired cards cannot be unfrozen. Request a replacement.', { code: 'card_expired' })
  }
  const frozen = card.status !== 'frozen'
  await settle(null, LATENCY.slow)
  const updated = { ...card, status: frozen ? 'frozen' : 'active' }
  saveCard(updated)
  pushNotification({
    category: 'security',
    title: frozen ? 'Card frozen' : 'Card unfrozen',
    body: frozen
      ? `Your ${card.nickname} card ending ${card.last4} is frozen. No payments will be authorised.`
      : `Your ${card.nickname} card ending ${card.last4} is active again.`,
    actionLabel: 'Manage cards',
    actionPath: '/app/cards',
  })
  return updated
}

export async function updateCardSettings(cardId, patch) {
  const card = getState().cards.find((item) => item.id === cardId)
  if (!card) throw new ApiError('That card is unavailable.', { code: 'not_found' })
  await settle(null, LATENCY.fast)
  const updated = {
    ...card,
    nickname: patch.nickname ? String(patch.nickname).trim() : card.nickname,
    contactless: patch.contactless ?? card.contactless,
    limits: { ...card.limits, ...(patch.limits ?? {}) },
  }
  saveCard(updated)
  return updated
}

export async function requestNewCard(payload) {
  const fields = {}
  if (!payload.type) fields.type = 'Choose a card type'
  if (!payload.currency) fields.currency = 'Choose a currency'
  if (Object.keys(fields).length) {
    throw new ApiError('Please complete the card request.', { code: 'validation_error', fields })
  }

  await settle(null, LATENCY.slow)

  const brand = payload.brand ?? (Math.random() > 0.5 ? 'Mastercard' : 'Visa')
  const isVirtual = payload.type === 'virtual'
  const number = generateCardNumber(brand)
  const card = {
    id: nextEntityId('card', 'cards'),
    nickname: payload.nickname?.trim() || (isVirtual ? 'New virtual card' : 'New debit card'),
    holderName: (payload.holderName || `${getState().user.firstName} ${getState().user.lastName}`).toUpperCase(),
    number,
    maskedNumber: `•••• •••• •••• ${number.replace(/\D/g, '').slice(-4)}`,
    last4: number.replace(/\D/g, '').slice(-4),
    expiry: generateExpiry(isVirtual ? 3 : 4),
    cvv: `${Math.floor(100 + Math.random() * 900)}`,
    brand,
    scheme: 'debit',
    type: isVirtual ? 'Virtual' : 'Physical',
    currency: payload.currency,
    status: isVirtual ? 'active' : 'processing',
    isDefault: false,
    accountId: payload.accountId ?? getState().accounts[0].id,
    contactless: !isVirtual,
    limits: {
      daily: payload.currency === 'USD' ? 1000 : 250000,
      monthly: payload.currency === 'USD' ? 5000 : 1500000,
      online: true,
      international: false,
    },
    spendThisMonth: 0,
    issuedOn: new Date().toISOString(),
    color: isVirtual ? 'brand' : 'ink',
  }
  saveCard(card)
  pushNotification({
    category: 'account',
    title: isVirtual ? 'Virtual card created' : 'Physical card requested',
    body: isVirtual
      ? `Your ${brand} virtual card ending ${card.last4} is ready to use online.`
      : `Your ${brand} debit card is being produced and will be delivered in 3–5 working days.`,
    actionLabel: 'Manage cards',
    actionPath: '/app/cards',
  })
  return card
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export async function setNotificationRead(id, read = true) {
  const notifications = getState().notifications.map((item) => (item.id === id ? { ...item, read } : item))
  saveNotifications(notifications)
  return { id, read }
}

export async function markAllNotificationsRead() {
  await settle(null, LATENCY.fast)
  const notifications = getState().notifications.map((item) => ({ ...item, read: true }))
  saveNotifications(notifications)
  return notifications
}

export async function deleteNotification(id) {
  const notifications = getState().notifications.filter((item) => item.id !== id)
  saveNotifications(notifications)
  return { id }
}

/* ------------------------------------------------------------------ */
/* Profile & security                                                  */
/* ------------------------------------------------------------------ */

export async function updateProfile(patch) {
  const fields = {}
  if (patch.email !== undefined) {
    const email = String(patch.email).trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fields.email = 'Enter a valid email address'
  }
  if (patch.phone !== undefined) {
    const phone = String(patch.phone).replace(/\s/g, '')
    if (phone && !/^\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(phone)) fields.phone = 'Enter a valid U.S. phone number'
  }
  if (patch.firstName !== undefined && String(patch.firstName).trim().length < 2) {
    fields.firstName = 'First name is too short'
  }
  if (patch.lastName !== undefined && String(patch.lastName).trim().length < 2) {
    fields.lastName = 'Last name is too short'
  }
  if (Object.keys(fields).length) {
    throw new ApiError('Please correct the highlighted fields.', { code: 'validation_error', fields })
  }
  await settle(null, LATENCY.normal)
  const user = updateUser({ ...patch, address: patch.address ?? getState().user.address })
  return user
}

export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  const state = getState()
  const fields = {}
  if (!currentPassword) fields.currentPassword = 'Enter your current password'
  else if (currentPassword !== state.password) fields.currentPassword = 'That password is incorrect'
  if (!newPassword) fields.newPassword = 'Enter a new password'
  else if (String(newPassword).length < 8) fields.newPassword = 'Use at least 8 characters'
  else if (newPassword === currentPassword) fields.newPassword = 'Choose a password you have not used before'
  if (newPassword !== confirmPassword) fields.confirmPassword = 'Passwords do not match'
  if (Object.keys(fields).length) {
    throw new ApiError('We could not update your password.', { code: 'validation_error', fields })
  }
  await settle(null, LATENCY.slow)
  setPassword(String(newPassword))
  pushNotification({
    category: 'security',
    title: 'Password changed',
    body: 'Your Meridian password was changed. If this was not you, contact support immediately.',
    actionLabel: 'Security settings',
    actionPath: '/app/security',
    important: true,
  })
  return { success: true }
}

export async function updateSecuritySettings(patch) {
  await settle(null, LATENCY.fast)
  const security = updateSecurity(patch)
  if (patch.twoFactorEnabled !== undefined) {
    pushNotification({
      category: 'security',
      title: patch.twoFactorEnabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
      body: patch.twoFactorEnabled
        ? 'Your account is now protected with an extra verification step.'
        : '2FA was turned off for your account. We recommend keeping it on.',
      actionLabel: 'Security settings',
      actionPath: '/app/security',
      important: !patch.twoFactorEnabled,
    })
  }
  return security
}

export async function revokeSession(id) {
  await settle(null, LATENCY.normal)
  const sessions = removeSession(id)
  pushNotification({
    category: 'security',
    title: 'Device signed out',
    body: 'A device was signed out of your Meridian account.',
    actionLabel: 'Security settings',
    actionPath: '/app/security',
  })
  return sessions
}

export async function revokeOtherSessions() {
  await settle(null, LATENCY.slow)
  const state = getState()
  const current = state.sessions.find((session) => session.current)
  patchState({ sessions: current ? [current] : [] })
  pushNotification({
    category: 'security',
    title: 'All other devices signed out',
    body: 'Every session except this device has been revoked.',
    actionLabel: 'Security settings',
    actionPath: '/app/security',
  })
  return getState().sessions
}

/* ------------------------------------------------------------------ */
/* Statements                                                          */
/* ------------------------------------------------------------------ */

export async function exportStatement({ accountId, from, to, format = 'csv' }) {
  const statement = await fetchStatement({ accountId, from, to })
  const { buildStatementCsv, buildStatementHtml } = await import('./statement')
  const span = `${statement.period.from}_${statement.period.to}`
  if (format === 'html') {
    return {
      filename: `meridian-statement-${span}.html`,
      mimeType: 'text/html',
      content: buildStatementHtml(statement),
    }
  }
  return {
    filename: `meridian-statement-${span}.csv`,
    mimeType: 'text/csv',
    content: buildStatementCsv(statement),
  }
}









