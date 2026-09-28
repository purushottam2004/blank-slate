import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthError, Provider, Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from './authContext'
import { getSupabaseClient } from './supabaseClient'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => getSupabaseClient(), [])

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const signInWithOAuth = useCallback(
    async (provider: Provider, redirectTo?: string) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo ?? window.location.origin,
        },
      })
      return { error }
    },
    [supabase],
  )

  const signInWithPhone = useCallback(
    async (phone: string) => {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      return { error }
    },
    [supabase],
  )

  const verifyPhoneOtp = useCallback(
    async (phone: string, token: string) => {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      })
      return { error }
    },
    [supabase],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signOut,
      signInWithOAuth,
      signInWithPhone,
      verifyPhoneOtp,
    }),
    [
      session,
      loading,
      signOut,
      signInWithOAuth,
      signInWithPhone,
      verifyPhoneOtp,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export type { AuthError }
