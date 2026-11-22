import * as ImagePicker from 'expo-image-picker'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { screen } from '../components/screenStyles'
import { createPost, loadGroups, uploadImage, type Group } from '../lib/gym'


export default function NewPostScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const [body, setBody] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [profile, setProfile] = useState(true)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      void loadGroups()
        .then(setGroups)
        .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load groups'))
    }, []),
  )

  async function pick() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Photo access is required to attach a picture')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (!result.canceled) setImageUri(result.assets[0]?.uri ?? null)
  }

  async function save() {
    try {
      const userId = session?.user.id
      if (!userId) throw new Error('Not signed in')
      const imagePath = imageUri ? await uploadImage('post-images', userId, imageUri) : null
      await createPost({
        body,
        imagePath,
        profile,
        groupIds: groups.filter((group) => selected[group.id]).map((group) => group.id),
      })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>New post</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <Text style={screen.label}>Text</Text>
      <TextInput multiline onChangeText={setBody} style={[screen.input, { minHeight: 80 }]} value={body} />
      <Pressable onPress={() => void pick()} style={screen.secondaryButton}>
        <Text style={screen.secondaryButtonText}>{imageUri ? 'Photo chosen' : 'Add a photo'}</Text>
      </Pressable>
      <Text style={screen.muted}>Who can see it</Text>
      <View style={screen.card}>
        <Pressable onPress={() => setProfile((current) => !current)} style={[screen.row, screen.rowFirst]}>
          <Text style={screen.rowTitle}>Profile</Text>
          <Text style={screen.muted}>{profile ? 'On' : 'Off'}</Text>
        </Pressable>
        {groups.map((group) => (
          <Pressable
            key={group.id}
            onPress={() => setSelected((current) => ({ ...current, [group.id]: !current[group.id] }))}
            style={screen.row}
          >
            <Text style={screen.rowTitle}>{group.name}</Text>
            <Text style={screen.muted}>{selected[group.id] ? 'On' : 'Off'}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => void save()} style={screen.save}>
        <Text style={screen.buttonText}>Post</Text>
      </Pressable>
    </SafeAreaView>
  )
}
