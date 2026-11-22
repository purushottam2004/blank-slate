import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { screen } from '../components/screenStyles'
import { saveAvatarPath, uploadImage } from '../lib/gym'

export default function EditPhotoScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function pick() {
    const userId = session?.user.id
    if (!userId) return
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Photo access is required')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (result.canceled || !result.assets[0]) return
    try {
      const path = await uploadImage('avatars', userId, result.assets[0].uri)
      await saveAvatarPath(userId, path)
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save photo')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>Edit photo</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <Pressable onPress={() => void pick()} style={screen.save}>
        <Text style={screen.buttonText}>Choose a photo</Text>
      </Pressable>
    </SafeAreaView>
  )
}
