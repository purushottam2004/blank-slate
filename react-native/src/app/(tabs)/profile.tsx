import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../auth/AuthProvider'
import { screen } from '../../components/screenStyles'
import { loadProfile, publicImageUrl, type Profile } from '../../lib/gym'

export default function ProfileScreen() {
  const { session, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const userId = session?.user.id
    if (!userId) return
    try {
      setProfile(await loadProfile(userId))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load profile')
    }
  }, [session])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const photo = publicImageUrl('avatars', profile?.avatar_path ?? null)

  return (
    <SafeAreaView style={screen.page}>
      <Text style={screen.title}>Profile</Text>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <View style={{ alignItems: 'center', gap: 8 }}>
        {photo ? (
          <Image source={{ uri: photo }} style={{ width: 84, height: 84, borderRadius: 42 }} />
        ) : (
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#e7e5e4' }} />
        )}
        <Text style={screen.title}>{profile?.display_name ?? 'Add a name'}</Text>
      </View>
      <View style={screen.card}>
        <Pressable onPress={() => router.push('/edit-name')} style={[screen.row, screen.rowFirst]}>
          <Text style={screen.rowTitle}>Edit name</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/edit-photo')} style={screen.row}>
          <Text style={screen.rowTitle}>Edit photo</Text>
        </Pressable>
        <Pressable onPress={() => void signOut()} style={screen.row}>
          <Text style={screen.rowTitle}>Sign out</Text>
        </Pressable>
      </View>
      <Text style={screen.muted}>{session?.user.email}</Text>
    </SafeAreaView>
  )
}
