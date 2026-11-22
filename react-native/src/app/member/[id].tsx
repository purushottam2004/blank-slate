import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { screen } from '../../components/screenStyles'
import { loadIntakes, loadProfile, loadSets, type Intake, type Profile, type SetLog } from '../../lib/gym'
import { formatDay, localDate } from '../../lib/localDate'

export default function MemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const day = localDate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [sets, setSets] = useState<SetLog[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const [nextProfile, nextIntakes, nextSets] = await Promise.all([
        loadProfile(id),
        loadIntakes(id, day),
        loadSets(id, day),
      ])
      setProfile(nextProfile)
      setIntakes(nextIntakes)
      setSets(nextSets)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open this person')
    }
  }, [id, day])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  return (
    <SafeAreaView style={screen.page}>
      <Pressable onPress={() => router.back()}>
        <Text style={screen.addText}>Back</Text>
      </Pressable>
      <Text style={screen.title}>{profile?.display_name ?? 'Member'}</Text>
      <Text style={screen.muted}>{formatDay(day)}</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <View style={screen.card}>
        <View style={[screen.row, screen.rowFirst]}>
          <Text style={screen.muted}>Diet</Text>
        </View>
        {intakes.map((row) => (
          <View key={row.id} style={screen.row}>
            <Text style={screen.rowTitle}>{row.food.name}</Text>
            <Text style={screen.rowMeta}>
              {row.amount} {row.food.measure}
            </Text>
          </View>
        ))}
      </View>
      <View style={screen.card}>
        <View style={[screen.row, screen.rowFirst]}>
          <Text style={screen.muted}>Lifts</Text>
        </View>
        {sets.map((row) => (
          <View key={row.id} style={screen.row}>
            <Text style={screen.rowTitle}>
              {row.lift.name} · {row.attempt} · {row.reps} reps
            </Text>
            <Text style={screen.rowMeta}>{row.load_kg} kg</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  )
}
