import { useState, type FormEvent } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { Button, Input, Label, toast } from '@repo/ui'
import { getSupabaseClient } from './supabaseClient'

export type LoginFormProps = {
  /** Optional Supabase client override. Defaults to the env-configured client. */
  client?: SupabaseClient
  /** Called after a successful sign-in. */
  onSignedIn?: (user: User) => void
}

type AuthMethod = 'email' | 'phone'

function resolveClient(client?: SupabaseClient) {
  return client ?? getSupabaseClient()
}

export function LoginForm({ client, onSignedIn }: LoginFormProps) {
  const [method, setMethod] = useState<AuthMethod>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function showError(message: string) {
    setError(message)
    toast({
      variant: 'destructive',
      title: 'Sign-in failed',
      description: message,
    })
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = resolveClient(client)
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (signInError) {
        showError(signInError.message)
        return
      }

      if (data.user) {
        onSignedIn?.(data.user)
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Unexpected error during sign-in.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    const supabase = resolveClient(client)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (oauthError) {
      showError(oauthError.message)
      setLoading(false)
    }
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = resolveClient(client)
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone })
    if (otpError) {
      showError(otpError.message)
    } else {
      setOtpSent(true)
      toast({
        title: 'Code sent',
        description: 'Check your phone for the SMS code.',
      })
    }
    setLoading(false)
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = resolveClient(client)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })
    if (verifyError) {
      showError(verifyError.message)
      setLoading(false)
      return
    }
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      onSignedIn?.(data.user)
    }
    setLoading(false)
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={method === 'email' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            setMethod('email')
            setError(null)
          }}
        >
          Email
        </Button>
        <Button
          type="button"
          variant={method === 'phone' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            setMethod('phone')
            setError(null)
          }}
        >
          Phone
        </Button>
      </div>

      {method === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-destructive m-0 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      ) : otpSent ? (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otp">SMS code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
          </div>
          {error && <p className="text-destructive m-0 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify code'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setOtpSent(false)
              setOtp('')
              setError(null)
            }}
          >
            Use a different number
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+15555550100"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              autoComplete="tel"
            />
          </div>
          {error && <p className="text-destructive m-0 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send OTP'}
          </Button>
        </form>
      )}

      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span className="bg-border h-px flex-1" />
        or
        <span className="bg-border h-px flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => void handleGoogle()}
      >
        Continue with Google
      </Button>
    </div>
  )
}
