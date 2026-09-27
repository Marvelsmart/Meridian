import { STORAGE_KEYS } from './constants'
import { readStorage, writeStorage, removeStorage } from './storage'
import { USER, ACCOUNTS } from '@/data/users'
import { TRANSACTIONS } from '@/data/transactions'
import { BENEFICIARIES } from '@/data/beneficiaries'
import { CARDS } from '@/data/cards'
import { NOTIFICATIONS } from '@/data/notifications'
import { ACTIVE_SESSIONS } from '@/data/security'

/**
 * Tiny in-memory "database" that mirrors what a REST API would return.
 *
 *   data/*.js  →  db.js (this file)  →  lib/api.js  →  contexts  →  UI
 *
 * It persists to localStorage so demo edits (a transfer, a frozen card) survive
 * a refresh. When a real backend arrives, delete this file and point `api.js`
 * at `fetch()` — nothing in the UI needs to change.
 */

const clone = (value) => JSON.parse(JSON.stringify(value))

function seed() {
  return {
    user: { ...clone(USER), security: clone(USER.security) },
    accounts: clone(ACCOUNTS),
    transactions: clone(TRANSACTIONS),
    beneficiaries: clone(BENEFICIARIES),
    cards: clone(CARDS),
    notifications: clone(NOTIFICATIONS),
    sessions: clone(ACTIVE_SESSIONS),
    password: 'Northstar2026!',
  }
}

function load() {
  const stored = readStorage(STORAGE_KEYS.db, null)
  if (!stored || typeof stored !== 'object' || !Array.isArray(stored.transactions)) return null
  return stored
}

let state = load() ?? seed()

function commit() {
  writeStorage(STORAGE_KEYS.db, state)
}

export function getState() {
  return state
}

export function patchState(patch) {
  state = { ...state, ...patch }
  commit()
  return state
}

export function resetDatabase() {
  state = seed()
  removeStorage(STORAGE_KEYS.db)
  return state
}

/* ------------------------------------------------------------------ */
/* Sequential ID + reference helpers (mimic server-side generation)    */
/* ------------------------------------------------------------------ */

function nextId(prefix, collection) {
  const max = collection.reduce((highest, item) => {
    const numeric = Number(String(item.id).replace(/\D/g, ''))
    return Number.isNaN(numeric) ? highest : Math.max(highest, numeric)
  }, 0)
  return `${prefix}_${String(max + 1).padStart(2, '0')}`
}

export function makeReference(prefix) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `${prefix}-${code}`
}

export function nextEntityId(prefix, key) {
  return nextId(prefix, state[key])
}

export function nextTransactionId() {
  return nextId('txn', state.transactions)
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export function insertTransaction(transaction) {
  state.transactions = [transaction, ...state.transactions]
  commit()
  return transaction
}

export function updateTransaction(id, patch) {
  let updated = null
  state.transactions = state.transactions.map((txn) => {
    if (txn.id !== id) return txn
    updated = { ...txn, ...patch }
    return updated
  })
  commit()
  return updated
}

export function updateAccount(accountId, patch) {
  let updated = null
  state.accounts = state.accounts.map((account) => {
    if (account.id !== accountId) return account
    const { delta = 0, ...rest } = patch
    const balance = Number((account.balance + delta).toFixed(2))
    const hold = Number((account.ledgerBalance - account.balance).toFixed(2))
    updated = {
      ...account,
      ...rest,
      balance,
      ledgerBalance: Number((balance + hold).toFixed(2)),
      available: Number((balance - hold).toFixed(2)),
    }
    return updated
  })
  commit()
  return updated
}

export function saveBeneficiary(beneficiary) {
  const exists = state.beneficiaries.some((item) => item.id === beneficiary.id)
  state.beneficiaries = exists
    ? state.beneficiaries.map((item) => (item.id === beneficiary.id ? { ...item, ...beneficiary } : item))
    : [{ ...beneficiary }, ...state.beneficiaries]
  commit()
  return beneficiary
}

export function deleteBeneficiary(id) {
  state.beneficiaries = state.beneficiaries.filter((item) => item.id !== id)
  commit()
  return id
}

export function saveCard(card) {
  const exists = state.cards.some((item) => item.id === card.id)
  state.cards = exists
    ? state.cards.map((item) => (item.id === card.id ? { ...item, ...card } : item))
    : [...state.cards, card]
  commit()
  return card
}

export function saveNotifications(notifications) {
  state.notifications = notifications
  commit()
  return state.notifications
}

export function updateUser(patch) {
  state.user = { ...state.user, ...patch }
  commit()
  return state.user
}

export function updateSecurity(patch) {
  state.user = { ...state.user, security: { ...state.user.security, ...patch } }
  commit()
  return state.user.security
}

export function setPassword(password) {
  state.password = password
  commit()
  return true
}

export function removeSession(id) {
  state.sessions = state.sessions.filter((session) => session.id !== id)
  commit()
  return state.sessions
}
