import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Runs an async function and tracks loading / error / data.
 * Every page or panel that fetches gets the three UX states for free.
 *
 *   const { data, loading, error, refetch } = useAsync(() => api.fetchStatement(args), [args])
 */
export function useAsync(asyncFn, deps = [], { immediate = true, initialData = null } = {}) {
  const [state, setState] = useState({ data: initialData, loading: immediate, error: null })
  const mounted = useRef(true)
  const runId = useRef(0)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args) => {
      const id = runId.current + 1
      runId.current = id
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const data = await asyncFn(...args)
        if (mounted.current && runId.current === id) setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        if (mounted.current && runId.current === id) setState((prev) => ({ ...prev, loading: false, error }))
        throw error
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  )

  useEffect(() => {
    if (!immediate) return
    execute().catch(() => {
      /* error state is already captured */
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return useMemo(
    () => ({
      ...state,
      refetch: (...args) => execute(...args),
      setData: (data) => setState((prev) => ({ ...prev, data })),
    }),
    [state, execute],
  )
}
