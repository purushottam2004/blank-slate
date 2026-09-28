import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui'
import { LoginForm } from './LoginForm'
import { getSeedAssetPublicUrl } from './seedAssets'
import { useAuth } from './useAuth'

const FALLBACK_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96" viewBox="0 0 160 96">
      <rect width="160" height="96" rx="12" fill="#eef2ff"/>
      <text x="80" y="54" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#4f46e5">template</text>
    </svg>`,
  )

export function LoginPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/'
  const [photoSrc, setPhotoSrc] = useState(
    () => getSeedAssetPublicUrl() || FALLBACK_PHOTO,
  )

  if (loading) {
    return <p className="p-8">Loading…</p>
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  return (
    <main className="flex flex-col items-center gap-6 p-8 text-left">
      <img
        src={photoSrc}
        alt="Seeded example photo"
        width={160}
        height={96}
        className="h-24 w-40 rounded-xl border object-cover"
        onError={() => setPhotoSrc(FALLBACK_PHOTO)}
      />

      <div className="w-full max-w-sm">
        <h1 className="m-0 text-4xl">Sign in</h1>
        <p className="text-muted-foreground mt-2">
          Authentication is required to use this app.
        </p>
      </div>

      <Card className="w-full max-w-sm text-left">
        <CardContent className="pt-6">
          <LoginForm />
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" size="sm">
            How to sign in
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign-in methods</DialogTitle>
            <DialogDescription>
              Email and password work against the seeded users. Google and phone
              OTP talk to Supabase Auth directly — enable those providers in{' '}
              <code>supabase/config.toml</code> before using them.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  )
}
