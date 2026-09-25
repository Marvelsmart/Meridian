import { filterTransactions, inRange, statementTotals, sumsFor } from './analytics'
import { readStorage, removeStorage, writeStorage } from './storage'
import { STORAGE_KEYS } from './constants'
import { toInputDate } from './format'
import { managerCodeForRegistration } from '@/config/demo'

export const LATENCY = { fast: 0, normal: 0, slow: 0 }
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const DEVICE_KEY = 'northstarbank.device-id'

export class ApiError extends Error {
  constructor(message, { code = 'api_error', fields = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.fields = fields
  }
}

function getDeviceId() {
  const existing = readStorage(DEVICE_KEY, null)
  if (existing) return existing
  const next = `web-${Math.random().toString(36).slice(2)}-${Date.now()}`
  writeStorage(DEVICE_KEY, next)
  return next
}

function normalizeAccount(account) {
  return { ...account, id: String(account.id ?? account._id) }
}

function normalizeTransaction(transaction) {
  return {
    ...transaction,
    id: String(transaction.id ?? transaction._id),
    accountId: transaction.accountId ?? transaction.account?._id ?? transaction.account,
    date: transaction.date ?? transaction.createdAt,
  }
}

function normalizeAppData(data) {
  return {
    ...data,
    accounts: (data.accounts ?? []).map(normalizeAccount),
    transactions: (data.transactions ?? []).map(normalizeTransaction),
    beneficiaries: data.beneficiaries ?? [],
    cards: (data.cards ?? []).map((card) => ({ ...card, id: String(card.id ?? card._id) })),
    notifications: data.notifications ?? [],
    sessions: data.sessions ?? [],
  }
}

async function requestBackend(path, options = {}) {
  const session = currentSession()
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': getDeviceId(),
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options.headers ?? {}),
      },
    })
  } catch {
    throw new ApiError('The banking service is unavailable. Please try again.', { code: 'network_error' })
  }
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(body.message ?? body.error ?? 'The request could not be completed.', {
      code: body.code ?? 'api_error',
      fields: body.fields ?? null,
    })
  }
  return body
}

const post = (body) => ({ method: 'POST', body: JSON.stringify(body) })

export async function login(credentials) {
  return requestBackend('/auth/login', post(credentials))
}

export async function register(payload) {
  const managerCode = managerCodeForRegistration()
  if (!managerCode) throw new ApiError('Complete the Bank Manager Code step before creating an account.', { code: 'manager_code_required' })
  return requestBackend('/auth/register', post({ ...payload, managerCode }))
}

export async function requestPasswordReset(email) { return requestBackend('/auth/password-reset/request', post({ email })) }
export async function resetPassword(payload) { return requestBackend('/auth/password-reset/confirm', post(payload)) }

export async function logout() {
  try { await requestBackend('/auth/logout', post({})) } finally { persistSession(null) }
  return { success: true }
}

export function currentSession() { return readStorage(STORAGE_KEYS.auth, null) }
export function persistSession(session) { session ? writeStorage(STORAGE_KEYS.auth, session) : removeStorage(STORAGE_KEYS.auth) }
export function resetDemoData() { removeStorage(STORAGE_KEYS.auth); removeStorage(STORAGE_KEYS.prefs); return true }
export const apiBaseUrl = API_BASE_URL

export async function getAppData() { return normalizeAppData(await requestBackend('/app-data')) }

export async function fetchTransactions(params = {}) {
  const response = await requestBackend('/transactions')
  const { page = 1, pageSize = 10, accountId = 'all', ...filters } = params
  const scoped = filterTransactions(response.items.map(normalizeTransaction), { ...filters, accountId })
  const total = scoped.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  return { items: scoped.slice((safePage - 1) * pageSize, safePage * pageSize), total, page: safePage, pageSize, pageCount, summary: sumsFor(scoped) }
}

export async function fetchTransaction(id) { return normalizeTransaction(await requestBackend(`/transactions/${id}`)) }
export async function fetchRecentTransactions(limit = 5, accountId = 'all') { return (await fetchTransactions({ pageSize: limit, accountId })).items }

export async function fetchDashboardSummary({ accountId, days = 30 } = {}) {
  const data = await getAppData()
  const account = data.accounts.find((item) => item.id === accountId) ?? data.accounts.find((item) => item.primary) ?? data.accounts[0]
  const transactions = data.transactions.filter((item) => item.accountId === account?.id)
  const since = new Date(); since.setDate(since.getDate() - days)
  const previousSince = new Date(since); previousSince.setDate(previousSince.getDate() - days)
  const window = inRange(transactions, since, new Date())
  return { account, windowDays: days, summary: sumsFor(window), previous: sumsFor(inRange(transactions, previousSince, since)), pending: window.filter((item) => item.status === 'pending').length, unreadNotifications: data.notifications.filter((item) => !item.read).length, recent: transactions.slice(0, 6), lastActiveAt: transactions[0]?.date ?? null }
}

export async function fetchNotifications() { return requestBackend('/notifications') }
export async function fetchStatement({ accountId, from, to }) {
  const query = `?accountId=${encodeURIComponent(accountId ?? '')}&from=${encodeURIComponent(toInputDate(from))}&to=${encodeURIComponent(toInputDate(to))}`
  const result = await requestBackend(`/statements${query}`)
  const transactions = result.transactions.map(normalizeTransaction).filter((item) => !from || !to || inRange([item], from, to).length)
  if (!transactions.length) throw new ApiError('No transactions were found for the selected period.', { code: 'empty_statement' })
  return { ...result, transactions, totals: statementTotals(transactions) }
}

export async function resolveAccountName({ accountNumber, bankCode }) {
  const digits = String(accountNumber ?? '').replace(/\D/g, '')
  if (digits.length !== 10 || !bankCode) throw new ApiError('Enter a valid account number and bank.', { code: 'validation_error' })
  return { name: `Recipient ${digits.slice(-4)}`, bank: null, accountNumber: digits }
}

async function movement(path, payload) {
  const result = await requestBackend(path, post(payload))
  return { ...result, transaction: normalizeTransaction(result.transaction), account: normalizeAccount(result.account) }
}

export async function createTransfer(payload) { return movement('/transfers', payload) }
export async function createBillPayment(payload) { return movement('/bill-payments', { ...payload, description: `${payload.providerId} bill payment`, provider: { name: payload.providerId } }) }
export async function createWithdrawal(payload) { return movement('/withdrawals', payload) }
export async function createDeposit(payload) { return movement('/add-funds', { ...payload, description: `Wallet top-up via ${payload.method ?? 'transfer'}` }) }

export async function createBeneficiary(payload) { return requestBackend('/beneficiaries', post(payload)) }
export async function updateBeneficiary(id, payload) { return requestBackend(`/beneficiaries/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }) }
export async function removeBeneficiary(id) { return requestBackend(`/beneficiaries/${id}`, { method: 'DELETE' }) }
export async function toggleBeneficiaryFavourite(id) { return requestBackend(`/beneficiaries/${id}/favourite`, post({})) }

export async function toggleCardFreeze(cardId) { return requestBackend(`/cards/${cardId}/freeze`, { method: 'PATCH', body: JSON.stringify({}) }) }
export async function updateCardSettings(cardId, patch) { return requestBackend(`/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify(patch) }) }
export async function requestNewCard(payload) { return requestBackend('/cards', post(payload)) }

export async function setNotificationRead(id, read = true) { return requestBackend(`/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read }) }) }
export async function markAllNotificationsRead() { return requestBackend('/notifications/read-all', post({})) }
export async function deleteNotification(id) { return requestBackend(`/notifications/${id}`, { method: 'DELETE' }) }
export async function updateProfile(patch) { return requestBackend('/profile', { method: 'PATCH', body: JSON.stringify(patch) }) }
export async function changePassword(payload) { return requestBackend('/auth/password', post(payload)) }
export async function updateSecuritySettings(patch) { return requestBackend('/security', { method: 'PATCH', body: JSON.stringify(patch) }) }
export async function revokeSession(id) { return requestBackend(`/devices/${id}`, { method: 'DELETE' }) }
export async function revokeOtherSessions() { return requestBackend('/devices/others', { method: 'DELETE' }) }
export async function exportStatement({ accountId, from, to }) { return fetchStatement({ accountId, from, to }) }
