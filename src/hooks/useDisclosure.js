import { useCallback, useMemo, useState } from 'react'

/** Boolean open/close state for modals, drawers and sheets. */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)
  return useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((value) => !value),
      set: setIsOpen,
    }),
    [isOpen],
  )
}

/** Shows a short-lived "processing" phase for optimistic UI actions. */
export function usePendingAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const run = useCallback(async (action) => {
    setPending(true)
    setError(null)
    try {
      return await action()
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }, [])
  return { pending, error, run, reset: () => setError(null) }
}
