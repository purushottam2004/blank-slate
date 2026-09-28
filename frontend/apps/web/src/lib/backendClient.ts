import { getSupabaseClient } from '@repo/auth'

function getBackendBaseUrl(): string {
  const base = import.meta.env.VITE_BACKEND_URL
  if (!base) {
    throw new Error('Missing VITE_BACKEND_URL. Set it in frontend/.env')
  }
  return base.replace(/\/$/, '')
}

export type HelloResponse = {
  message: string
  authenticated: boolean
  user: { id: string | null; email: string | null }
}

/**
 * Authenticated fetch against the FastAPI backend.
 * Attaches the current Supabase access token as Bearer auth.
 */
export async function backendFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const url = `${getBackendBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${session.access_token}`)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...init, headers })

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText)
    throw new Error(detail || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function getHello(): Promise<HelloResponse> {
  return backendFetch<HelloResponse>('/api/v1/hello')
}
