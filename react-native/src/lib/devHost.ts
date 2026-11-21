const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost'])

/**
 * The Android emulator reaches this computer as 10.0.2.2.
 * The iOS simulator and Expo web can use 127.0.0.1.
 * A LAN address is left unchanged so a physical phone can still be configured by hand.
 */
export function rewriteLocalHostForPlatform(url: string, os: string): string {
  const trimmed = url.replace(/\/$/, '')
  if (os !== 'android') return trimmed

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return trimmed
  }

  if (LOOPBACK_HOSTS.has(parsed.hostname)) {
    parsed.hostname = '10.0.2.2'
  }

  const path = parsed.pathname === '/' ? '' : parsed.pathname
  return `${parsed.protocol}//${parsed.host}${path}${parsed.search}`
}
