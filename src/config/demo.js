import { readSessionStorage, writeSessionStorage, removeSessionStorage } from '@/lib/storage'

/**
 * Front-end demo configuration.
 *
 * Everything here exists so the demo can behave realistically without a
 * backend. Nothing in this file is real security or real money: when the API
 * arrives, delete these values and read them from the server instead.
 */

/**
 * Fictional Bank Manager Code that unlocks the signup form.
 *
 * This is a front-end/demo gateway only — it is NOT authentication and it must
 * never be treated as banking security. The code is fixed (the customer cannot
 * invent their own) so the demo flow is always predictable.
 */
export const DEMO_MANAGER_CODE = 'BANKMANAGER2026'

/** sessionStorage key — the gate unlocks for the current browser tab only. */
export const MANAGER_CODE_STORAGE_KEY = 'northstarbank.gate.manager-code'

/** Preset opening balances offered on the signup form (USD, demo money). */
export const DEMO_BALANCE_PRESETS = [500, 1000, 2500, 5000, 10000]

export const MIN_INITIAL_BALANCE = 100
export const MAX_INITIAL_BALANCE = 1000000

/** Case-insensitive comparison so typing "bankmanager2026" still works. */
export function isValidManagerCode(value) {
  return String(value ?? '').trim().toUpperCase() === DEMO_MANAGER_CODE
}

/** '7,500' · '$7500' · '7500.50' → 7500.5 · '' → null */
export function parseBalanceInput(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const [whole, ...rest] = cleaned.split('.')
  const decimal = rest.join('').slice(0, 2)
  const amount = Number(decimal ? `${whole}.${decimal}` : whole)
  return Number.isFinite(amount) ? amount : null
}

/** 7500 → '7500' (used as the value of the custom amount input). */
export function balanceToInputText(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
}

/** Validation for the signup form's opening balance. */
export function initialBalanceError(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'Select an amount or enter a custom balance'
  }
  const amount = Number(value)
  if (amount < MIN_INITIAL_BALANCE) return `Enter at least $${MIN_INITIAL_BALANCE.toLocaleString('en-US')}`
  if (amount > MAX_INITIAL_BALANCE) return `Enter an amount below $${MAX_INITIAL_BALANCE.toLocaleString('en-US')}`
  return null
}

/* ------------------------------------------------------------------ */
/* Bank Manager Code gate (demo only)                                  */
/* ------------------------------------------------------------------ */

/**
 * The gate lives for the current tab session (sessionStorage), so closing the
 * tab asks for the code again. Swap these three helpers for real API
 * verification later — the UI only cares about the boolean.
 */
export function isManagerCodeUnlocked() {
  return Boolean(readSessionStorage(MANAGER_CODE_STORAGE_KEY, null))
}

export function unlockManagerCode(code = true) {
  return writeSessionStorage(MANAGER_CODE_STORAGE_KEY, code)
}

export function lockManagerCode() {
  return removeSessionStorage(MANAGER_CODE_STORAGE_KEY)
}

export function managerCodeForRegistration() {
  const value = readSessionStorage(MANAGER_CODE_STORAGE_KEY, null)
  return typeof value === 'string' ? value : null
}


