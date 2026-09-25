/** Small localStorage helper with safe JSON parsing — never throws. */
export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/**
 * sessionStorage variants — used for per-tab state such as the demo signup
 * gate, which should not survive the tab being closed.
 */
export function readSessionStorage(key, fallback = null) {
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeSessionStorage(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeSessionStorage(key) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
