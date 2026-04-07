const STORAGE_KEYS = {
  users: 'portfolio_users',
  session: 'portfolio_session',
  portfolios: 'portfolio_portfolios',
} as const

export function readStorage<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key)

  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStorageKey(name: keyof typeof STORAGE_KEYS) {
  return STORAGE_KEYS[name]
}
