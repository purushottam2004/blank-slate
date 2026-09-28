import { createContext } from 'react'
import type { AuthError, Provider, Session, User } from '@supabase/supabase-js'

export type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithOAuth: (
    provider: Provider,
    redirectTo?: string,
  ) => Promise<{ error: AuthError | null }>
  signInWithPhone: (phone: string) => Promise<{ error: AuthError | null }>
  verifyPhoneOtp: (
    phone: string,
    token: string,
  ) => Promise<{ error: AuthError | null }>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
