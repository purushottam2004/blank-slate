import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSupabaseClient } from '../lib/supabase'

type AuthContextValue = {
  ready: boolean
  session: Session | null
  configError: string | null
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readConfigError(): string | null {
  try {
    getSupabaseClient()
    return null
  } catch (err) {
    return err instanceof Error ? err.message : 'Auth is not configured'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [configError] = useState(readConfigError)
  const [ready, setReady] = useState(configError !== null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (configError) return

    const supabase = getSupabaseClient()
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setReady(true)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [configError])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      configError,
      async signIn(email, password) {
        const { error } = await getSupabaseClient().auth.signInWithPassword({
          email,
          password,
        })
        return error?.message ?? null
      },
      async signOut() {
        await getSupabaseClient().auth.signOut()
      },
    }),
    [ready, session, configError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
