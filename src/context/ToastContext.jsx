import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { ToastViewport } from '@/components/ui/Toast'

const ToastContext = createContext(null)

const DEFAULT_DURATION = 4200

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const show = useCallback(
    ({ tone = 'info', title, description = null, duration = DEFAULT_DURATION, action = null }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [...current.slice(-2), { id, tone, title, description, action }])
      if (duration) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        )
      }
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      show,
      dismiss,
      success: (title, description, options) => show({ tone: 'success', title, description, ...options }),
      error: (title, description, options) => show({ tone: 'error', title, description, ...options }),
      warning: (title, description, options) => show({ tone: 'warning', title, description, ...options }),
      info: (title, description, options) => show({ tone: 'info', title, description, ...options }),
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
