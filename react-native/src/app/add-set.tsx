import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { screen } from '../components/screenStyles'
import { loadLifts, logSet, type Lift } from '../lib/gym'

export default function AddSetScreen() {
  const { day } = useLocalSearchParams<{ day: string }>()
  const router = useRouter()
  const [lifts, setLifts] = useState<Lift[]>([])
  const [liftId, setLiftId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState('1')
  const [reps, setReps] = useState('')
  const [loadKg, setLoadKg] = useState('')
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      void loadLifts()
        .then((rows) => {
          setLifts(rows)
          setLiftId((current) => current ?? rows[0]?.id ?? null)
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load lifts'))
    }, []),
  )

  async function save() {
    const attemptValue = Number(attempt)
    const repsValue = Number(reps)
    const loadValue = Number(loadKg)
    if (!liftId || !day || !Number.isInteger(attemptValue) || attemptValue < 1) {
      setError('Attempt is a whole number, 1 or more')
      return
    }
    if (!Number.isInteger(repsValue) || repsValue < 1) {
      setError('Reps are a whole number, 1 or more')
      return
    }
    if (!(loadValue >= 0)) {
      setError('Kilograms cannot be negative')
      return
    }
    try {
      await logSet({ liftId, day, attempt: attemptValue, reps: repsValue, loadKg: loadValue })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>Add a set</Text>
      <Text style={screen.muted}>{day}</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <View style={screen.card}>
        {lifts.map((lift, index) => (
          <Pressable
            key={lift.id}
            onPress={() => setLiftId(lift.id)}
            style={[screen.row, index === 0 && screen.rowFirst]}
          >
            <Text style={screen.rowTitle}>{lift.name}</Text>
            <Text style={screen.muted}>{liftId === lift.id ? 'Selected' : ''}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => router.push('/new-lift')} style={screen.add}>
          <Text style={screen.addText}>New lift</Text>
        </Pressable>
      </View>
      <Text style={screen.label}>Attempt</Text>
      <TextInput keyboardType="number-pad" onChangeText={setAttempt} style={screen.input} value={attempt} />
      <Text style={screen.label}>Reps</Text>
      <TextInput keyboardType="number-pad" onChangeText={setReps} style={screen.input} value={reps} />
      <Text style={screen.label}>Kilograms</Text>
      <TextInput keyboardType="decimal-pad" onChangeText={setLoadKg} style={screen.input} value={loadKg} />
      <Pressable onPress={() => void save()} style={screen.save}>
        <Text style={screen.buttonText}>Save</Text>
      </Pressable>
    </SafeAreaView>
  )
}
