import { useState } from 'react'
import { Button } from '@repo/ui'
import { getHello, type HelloResponse } from '../lib/backendClient'

export function HelloButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HelloResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await getHello()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '28rem',
      }}
    >
      <Button type="button" onClick={handleClick} disabled={loading}>
        {loading ? 'Calling…' : 'Hello'}
      </Button>

      {error && <p style={{ color: '#e5484d', margin: 0 }}>{error}</p>}

      {result && (
        <pre
          style={{
            margin: 0,
            padding: '0.75rem',
            background: '#f4f4f5',
            borderRadius: '8px',
            fontSize: '0.85rem',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
