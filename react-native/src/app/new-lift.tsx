import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { screen } from '../components/screenStyles'
import { createLift } from '../lib/gym'

export default function NewLiftScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!name.trim()) {
      setError('A lift needs a name')
      return
    }
    try {
      await createLift(name)
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create lift')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>New lift</Text>
      <Text style={screen.muted}>A name only. It cannot be edited later.</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <Text style={screen.label}>Name</Text>
      <TextInput onChangeText={setName} style={screen.input} value={name} />
      <Pressable onPress={() => void save()} style={screen.save}>
        <Text style={screen.buttonText}>Create lift</Text>
      </Pressable>
    </SafeAreaView>
  )
}
