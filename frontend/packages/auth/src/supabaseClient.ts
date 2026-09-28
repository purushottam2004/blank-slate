import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@repo/db'

let cachedClient: SupabaseClient<Database> | null = null

/**
 * Lazily creates (and memoizes) a typed Supabase client from Vite env vars.
 * Reading env lazily means an app can still render without credentials;
 * an error is only thrown when auth is actually attempted.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.',
    )
  }

  cachedClient = createClient<Database>(url, key)
  return cachedClient
}
