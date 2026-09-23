import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '@/lib/api'
import { STORAGE_KEYS } from '@/lib/constants'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const AppDataContext = createContext(null)

const EMPTY = {
  user: null,
  accounts: [],
  transactions: [],
  beneficiaries: [],
  cards: [],
  notifications: [],
  sessions: [],
}

const DEFAULT_PREFS = { hideBalances: false, activeAccountId: null, statementRange: '30d' }

/**
 * Single source of truth for everything the signed-in customer can see.
 * Loaded once from `lib/api.js`, then kept in sync by the action methods below.
 * `dataVersion` increments after each mutation so data-driven panels (like the
 * dashboard summary) can refetch without prop drilling.
 */
export function AppDataProvider({ children }) {
  const [state, setState] = useState(EMPTY)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [prefs, setPrefs] = useLocalStorage(STORAGE_KEYS.prefs, DEFAULT_PREFS)
  const safePrefs = prefs && typeof prefs === 'object' ? prefs : DEFAULT_PREFS

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await api.getAppData()
      setState(data)
      setStatus('ready')
      return data
    } catch (err) {
      setError(err)
      setStatus('error')
      throw err
    }
  }, [])

  useEffect(() => {
    load().catch(() => {
      /* error surfaced via state */
    })
  }, [load])

  const bump = useCallback(() => setDataVersion((version) => version + 1), [])

  const replaceAccount = (accounts, account) =>
    accounts.map((item) => (item.id === account.id ? account : item))

  const applyMovement = useCallback((result) => {
    setState((prev) => ({
      ...prev,
      transactions: [result.transaction, ...prev.transactions],
      accounts: replaceAccount(prev.accounts, result.account),
    }))
  }, [])

  const syncNotifications = useCallback(async () => {
    try {
      const notifications = await api.fetchNotifications()
      setState((prev) => ({ ...prev, notifications }))
    } catch {
      /* non-critical */
    }
  }, [])

  const actions = useMemo(() => {
    const wrapped = (fn) =>
      async (...args) => {
        const result = await fn(...args)
        bump()
        return result
      }
    return {
      reload: load,
      refreshNotifications: wrapped(syncNotifications),

      transfer: wrapped(async (payload) => {
        const result = await api.createTransfer(payload)
        applyMovement(result)
        await syncNotifications()
        return result
      }),
      payBill: wrapped(async (payload) => {
        const result = await api.createBillPayment(payload)
        applyMovement(result)
        await syncNotifications()
        return result
      }),
      withdraw: wrapped(async (payload) => {
        const result = await api.createWithdrawal(payload)
        applyMovement(result)
        await syncNotifications()
        return result
      }),
      addMoney: wrapped(async (payload) => {
        const result = await api.createDeposit(payload)
        applyMovement(result)
        await syncNotifications()
        return result
      }),

      addBeneficiary: wrapped(async (payload) => {
        const beneficiary = await api.createBeneficiary(payload)
        setState((prev) => ({ ...prev, beneficiaries: [beneficiary, ...prev.beneficiaries] }))
        await syncNotifications()
        return beneficiary
      }),
      editBeneficiary: wrapped(async (id, payload) => {
        const beneficiary = await api.updateBeneficiary(id, payload)
        setState((prev) => ({
          ...prev,
          beneficiaries: prev.beneficiaries.map((item) => (item.id === id ? beneficiary : item)),
        }))
        return beneficiary
      }),
      removeBeneficiary: wrapped(async (id) => {
        await api.removeBeneficiary(id)
        setState((prev) => ({ ...prev, beneficiaries: prev.beneficiaries.filter((item) => item.id !== id) }))
        return id
      }),
      toggleFavourite: wrapped(async (id) => {
        const beneficiary = await api.toggleBeneficiaryFavourite(id)
        setState((prev) => ({
          ...prev,
          beneficiaries: prev.beneficiaries.map((item) => (item.id === id ? beneficiary : item)),
        }))
        return beneficiary
      }),

      toggleFreeze: wrapped(async (cardId) => {
        const card = await api.toggleCardFreeze(cardId)
        setState((prev) => ({ ...prev, cards: prev.cards.map((item) => (item.id === cardId ? card : item)) }))
        await syncNotifications()
        return card
      }),
      requestCard: wrapped(async (payload) => {
        const card = await api.requestNewCard(payload)
        setState((prev) => ({ ...prev, cards: [...prev.cards, card] }))
        await syncNotifications()
        return card
      }),
      saveCardSettings: wrapped(async (cardId, patch) => {
        const card = await api.updateCardSettings(cardId, patch)
        setState((prev) => ({ ...prev, cards: prev.cards.map((item) => (item.id === cardId ? card : item)) }))
        return card
      }),

      markNotificationRead: wrapped(async (id, read = true) => {
        await api.setNotificationRead(id, read)
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((item) => (item.id === id ? { ...item, read } : item)),
        }))
      }),
      markAllNotificationsRead: wrapped(async () => {
        const notifications = await api.markAllNotificationsRead()
        setState((prev) => ({ ...prev, notifications }))
      }),
      deleteNotification: wrapped(async (id) => {
        await api.deleteNotification(id)
        setState((prev) => ({ ...prev, notifications: prev.notifications.filter((item) => item.id !== id) }))
      }),

      saveProfile: wrapped(async (patch) => {
        const user = await api.updateProfile(patch)
        setState((prev) => ({ ...prev, user }))
        return user
      }),
      saveSecurity: wrapped(async (patch) => {
        const security = await api.updateSecuritySettings(patch)
        setState((prev) => ({ ...prev, user: { ...prev.user, security } }))
        await syncNotifications()
        return security
      }),
      changePassword: wrapped(async (payload) => {
        const result = await api.changePassword(payload)
        await syncNotifications()
        return result
      }),
      revokeSession: wrapped(async (id) => {
        const sessions = await api.revokeSession(id)
        setState((prev) => ({ ...prev, sessions }))
        await syncNotifications()
        return sessions
      }),
      revokeOtherSessions: wrapped(async () => {
        const sessions = await api.revokeOtherSessions()
        setState((prev) => ({ ...prev, sessions }))
        await syncNotifications()
        return sessions
      }),
    }
  }, [applyMovement, bump, load, syncNotifications])

  const primaryAccount = useMemo(
    () => state.accounts.find((account) => account.primary) ?? state.accounts[0] ?? null,
    [state.accounts],
  )

  const activeAccount = useMemo(
    () => state.accounts.find((account) => account.id === safePrefs.activeAccountId) ?? primaryAccount,
    [state.accounts, safePrefs.activeAccountId, primaryAccount],
  )

  const unreadCount = useMemo(
    () => state.notifications.filter((notification) => !notification.read).length,
    [state.notifications],
  )

  const value = useMemo(
    () => ({
      ...state,
      status,
      error,
      dataVersion,
      primaryAccount,
      activeAccount,
      unreadCount,
      actions,
      prefs: safePrefs,
      setPrefs: (patch) => setPrefs({ ...safePrefs, ...patch }),
      selectAccount: (accountId) => setPrefs({ ...safePrefs, activeAccountId: accountId }),
      toggleHideBalances: () => setPrefs({ ...safePrefs, hideBalances: !safePrefs.hideBalances }),
      reload: load,
    }),
    [state, status, error, dataVersion, primaryAccount, activeAccount, unreadCount, actions, safePrefs, setPrefs, load],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used inside <AppDataProvider>')
  return context
}

