import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../auth/AuthProvider'
import { screen } from '../../components/screenStyles'
import { deleteSet, loadSets, type SetLog } from '../../lib/gym'
import { formatDay, localDate, shiftDate } from '../../lib/localDate'

export default function LiftsScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const userId = session?.user.id
  const [day, setDay] = useState(localDate)
  const [rows, setRows] = useState<SetLog[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    try {
      setRows(await loadSets(userId, day))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load lifts')
    }
  }, [userId, day])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const names = [...new Set(rows.map((row) => row.lift.name))]

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>Lifts</Text>
      <View style={screen.dayRow}>
        <Pressable onPress={() => setDay((current) => shiftDate(current, -1))}>
          <Text style={screen.addText}>Previous</Text>
        </Pressable>
        <Text style={screen.body}>{formatDay(day)}</Text>
        <Pressable onPress={() => setDay((current) => shiftDate(current, 1))}>
          <Text style={screen.addText}>Next</Text>
        </Pressable>
      </View>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      {names.map((name) => (
        <View key={name} style={screen.card}>
          <View style={[screen.row, screen.rowFirst]}>
            <Text style={screen.muted}>{name}</Text>
          </View>
          {rows
            .filter((row) => row.lift.name === name)
            .map((row) => (
              <Pressable key={row.id} onPress={() => void deleteSet(row.id).then(load)} style={screen.row}>
                <Text style={screen.rowTitle}>
                  {row.attempt} · {row.reps} reps
                </Text>
                <Text style={screen.rowMeta}>{row.load_kg} kg</Text>
              </Pressable>
            ))}
        </View>
      ))}
      <Pressable onPress={() => router.push({ pathname: '/add-set', params: { day } })} style={screen.save}>
        <Text style={screen.buttonText}>Add a set</Text>
      </Pressable>
      <Text style={screen.muted}>Tap a set to delete it.</Text>
    </SafeAreaView>
  )
}
