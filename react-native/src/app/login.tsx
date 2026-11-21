import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { screen } from '../components/screenStyles'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const message = await signIn(email.trim(), password)
      if (message) setError(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error during sign-in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>Sign in</Text>
      <Text style={screen.body}>Use a seeded user from the local Supabase project.</Text>
      <View>
        <Text style={screen.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          style={screen.input}
          value={email}
        />
      </View>
      <View>
        <Text style={screen.label}>Password</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          secureTextEntry
          style={screen.input}
          value={password}
        />
      </View>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleSignIn()}
        style={[screen.button, loading && screen.buttonDisabled]}
      >
        <Text style={screen.buttonText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
      </Pressable>
    </SafeAreaView>
  )
}
