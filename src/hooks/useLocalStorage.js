import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '@/lib/storage'

/** State that survives reloads (used for UI preferences like hidden balances). */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = readStorage(key, undefined)
    if (stored === undefined || stored === null) return initialValue
    return stored
  })

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  const update = useCallback((next) => setValue((current) => (typeof next === 'function' ? next(current) : next)), [])
  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return [value, update, reset]
}

/** Sets the browser tab title per page. */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    if (title) document.title = `${title} · Northstar`
    return () => {
      document.title = previous
    }
  }, [title])
}

/** Debounces fast-changing values such as search inputs. */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
