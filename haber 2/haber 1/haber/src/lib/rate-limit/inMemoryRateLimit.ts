// In-memory cooldown and lock helper for single-instance MVP deployments.
// This does not provide distributed guarantees across multiple servers or serverless instances.

type CooldownState = {
  allowed: boolean
  remainingMs: number
  remainingSeconds: number
  reason?: 'cooldown'
}

type LockState = {
  allowed: boolean
  remainingMs: number
  remainingSeconds: number
  reason?: 'locked'
}

const cooldownMap = new Map<string, number>()
const lockMap = new Map<string, number>()

function now() {
  return Date.now()
}

function toCooldownState(remainingMs: number): CooldownState {
  return {
    allowed: remainingMs <= 0,
    remainingMs: Math.max(0, remainingMs),
    remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
    reason: remainingMs > 0 ? 'cooldown' : undefined,
  }
}

function toLockState(remainingMs: number): LockState {
  return {
    allowed: remainingMs <= 0,
    remainingMs: Math.max(0, remainingMs),
    remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
    reason: remainingMs > 0 ? 'locked' : undefined,
  }
}

function getRemaining(expiry: number | undefined) {
  if (!expiry) return 0
  return Math.max(0, expiry - now())
}

function cleanupExpired(map: Map<string, number>, key: string) {
  const expiry = map.get(key)
  if (expiry && expiry <= now()) {
    map.delete(key)
    return undefined
  }
  return expiry
}

export function checkCooldown(key: string, cooldownMs: number): CooldownState {
  const expiry = cleanupExpired(cooldownMap, key)
  const remainingMs = getRemaining(expiry)

  if (!expiry && cooldownMs > 0) {
    return toCooldownState(0)
  }

  return toCooldownState(remainingMs)
}

export function setCooldown(key: string, cooldownMs: number) {
  cooldownMap.set(key, now() + Math.max(0, cooldownMs))
}

export function getCooldownRemaining(key: string): CooldownState {
  const expiry = cleanupExpired(cooldownMap, key)
  return toCooldownState(getRemaining(expiry))
}

export function acquireLock(key: string, ttlMs = 60_000): LockState {
  const expiry = cleanupExpired(lockMap, key)
  const remainingMs = getRemaining(expiry)

  if (remainingMs > 0) {
    return toLockState(remainingMs)
  }

  lockMap.set(key, now() + Math.max(1, ttlMs))
  return toLockState(0)
}

export function releaseLock(key: string) {
  lockMap.delete(key)
}

export async function withInMemoryLock<T>(key: string, fn: () => Promise<T>, ttlMs = 60_000): Promise<T> {
  const lockState = acquireLock(key, ttlMs)
  if (!lockState.allowed) {
    throw new Error(`Lock already held for key: ${key}`)
  }

  try {
    return await fn()
  } finally {
    releaseLock(key)
  }
}
