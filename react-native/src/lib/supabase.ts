import 'expo-sqlite/localStorage/install'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import { rewriteLocalHostForPlatform } from './devHost'

let cachedClient: SupabaseClient | null = null
let refreshBound = false

/**
 * Lazily creates (and memoizes) a Supabase client from EXPO_PUBLIC_ env vars.
 * Reading env lazily means the module can be imported without credentials;
 * an error is only thrown when auth is actually attempted.
 */
export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in react-native/.env.',
    )
  }

  cachedClient = createClient(rewriteLocalHostForPlatform(url, Platform.OS), key, {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })

  if (!refreshBound) {
    refreshBound = true
    AppState.addEventListener('change', (state) => {
      if (!cachedClient) return
      if (state === 'active') {
        void cachedClient.auth.startAutoRefresh()
      } else {
        void cachedClient.auth.stopAutoRefresh()
      }
    })
  }

  return cachedClient
}
