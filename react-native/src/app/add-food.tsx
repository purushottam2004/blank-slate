import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { screen } from '../components/screenStyles'
import { loadFoods, logIntake, type Food } from '../lib/gym'

export default function AddFoodScreen() {
  const { day } = useLocalSearchParams<{ day: string }>()
  const router = useRouter()
  const [foods, setFoods] = useState<Food[]>([])
  const [foodId, setFoodId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      void loadFoods()
        .then((rows) => {
          setFoods(rows)
          setFoodId((current) => current ?? rows[0]?.id ?? null)
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load foods'))
    }, []),
  )

  const selected = foods.find((food) => food.id === foodId)

  async function save() {
    const value = Number(amount)
    if (!foodId || !day || !(value > 0)) {
      setError('Choose a food and an amount greater than zero')
      return
    }
    try {
      await logIntake(foodId, value, day)
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>Add food</Text>
      <Text style={screen.muted}>{day}</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <View style={screen.card}>
        {foods.map((food, index) => (
          <Pressable
            key={food.id}
            onPress={() => setFoodId(food.id)}
            style={[screen.row, index === 0 && screen.rowFirst]}
          >
            <Text style={screen.rowTitle}>{food.name}</Text>
            <Text style={screen.muted}>{foodId === food.id ? food.measure : ''}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => router.push('/new-food')} style={screen.add}>
          <Text style={screen.addText}>New food</Text>
        </Pressable>
      </View>
      <Text style={screen.label}>Amount{selected ? ` (${selected.measure})` : ''}</Text>
      <TextInput keyboardType="decimal-pad" onChangeText={setAmount} style={screen.input} value={amount} />
      <Pressable onPress={() => void save()} style={screen.save}>
        <Text style={screen.buttonText}>Save</Text>
      </Pressable>
    </SafeAreaView>
  )
}
