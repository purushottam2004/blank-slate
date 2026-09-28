import { Button } from '@repo/ui'
import { useAuth } from '@repo/auth'
import { HelloButton } from '../components/HelloButton'

export function HomePage() {
  const { user, signOut } = useAuth()

  return (
    <main className="p-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="m-0">Web2</h1>
          <p className="text-muted-foreground mt-1">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </header>

      <section>
        <h2>Backend</h2>
        <p>
          Call the authenticated <code>/api/v1/hello</code> endpoint.
        </p>
        <HelloButton />
      </section>
    </main>
  )
}
