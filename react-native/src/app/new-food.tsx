import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { screen } from '../components/screenStyles'
import { createFood, loadNutrients, type Basis, type Measure, type Nutrient } from '../lib/gym'

export default function NewFoodScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [measure, setMeasure] = useState<Measure>('ml')
  const [basis, setBasis] = useState<Basis>('per_100')
  const [nutrients, setNutrients] = useState<Nutrient[]>([])
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadNutrients()
      .then(setNutrients)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load nutrients'))
  }, [])

  async function save() {
    try {
      const chosen = nutrients.flatMap((nutrient) => {
        const raw = amounts[nutrient.id]?.trim()
        if (!raw) return []
        const amount = Number(raw)
        if (!(amount >= 0)) throw new Error(`${nutrient.name} cannot be negative`)
        return [{ nutrient_id: nutrient.id, amount }]
      })
      await createFood({ name, measure, basis: measure === 'ml' ? 'per_100' : basis, nutrients: chosen })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create food')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>New food</Text>
      <Text style={screen.muted}>This cannot be edited later.</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <Text style={screen.label}>Name</Text>
      <TextInput onChangeText={setName} style={screen.input} value={name} />
      <View style={screen.card}>
        <Pressable onPress={() => setMeasure('ml')} style={[screen.row, screen.rowFirst]}>
          <Text style={screen.rowTitle}>Millilitres</Text>
          <Text style={screen.muted}>{measure === 'ml' ? 'Selected' : ''}</Text>
        </Pressable>
        <Pressable onPress={() => setMeasure('g')} style={screen.row}>
          <Text style={screen.rowTitle}>Grams</Text>
          <Text style={screen.muted}>{measure === 'g' ? 'Selected' : ''}</Text>
        </Pressable>
        {measure === 'g' ? (
          <Pressable
            onPress={() => setBasis((current) => (current === 'per_100' ? 'per_kg' : 'per_100'))}
            style={screen.row}
          >
            <Text style={screen.rowTitle}>{basis === 'per_kg' ? 'Per kilogram' : 'Per 100 g'}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={screen.muted}>Leave a nutrient blank to leave it off this food.</Text>
      <View style={screen.card}>
        {nutrients.map((nutrient, index) => (
          <View key={nutrient.id} style={[screen.row, index === 0 && screen.rowFirst]}>
            <Text style={screen.rowTitle}>{nutrient.name}</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={(value) => setAmounts((current) => ({ ...current, [nutrient.id]: value }))}
              placeholder={nutrient.unit}
              style={[screen.input, { width: 90, paddingVertical: 6 }]}
              value={amounts[nutrient.id] ?? ''}
            />
          </View>
        ))}
      </View>
      <Pressable onPress={() => void save()} style={screen.save}>
        <Text style={screen.buttonText}>Create food</Text>
      </Pressable>
    </SafeAreaView>
  )
}
