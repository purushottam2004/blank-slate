import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import { getHello, type HelloResponse } from '../lib/backendClient'
import { screen } from './screenStyles'

export function HelloButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HelloResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePress() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      setResult(await getHello())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handlePress()}
        style={[screen.button, loading && screen.buttonDisabled]}
      >
        <Text style={screen.buttonText}>{loading ? 'Calling…' : 'Hello'}</Text>
      </Pressable>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      {result ? <Text style={screen.result}>{JSON.stringify(result, null, 2)}</Text> : null}
    </>
  )
}
