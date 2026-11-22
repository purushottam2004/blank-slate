import { Stack, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { AuthProvider, useAuth } from '../auth/AuthProvider'
import { screen } from '../components/screenStyles'

function Navigation() {
  const { ready, session, configError } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!ready || configError) return
    const onLogin = segments[0] === 'login'
    if (!session && !onLogin) router.replace('/login')
    if (session && onLogin) router.replace('/diet')
  }, [ready, session, configError, segments, router])

  if (!ready) {
    return (
      <View style={screen.centered}>
        <ActivityIndicator />
      </View>
    )
  }

  if (configError) {
    return (
      <View style={screen.centered}>
        <Text style={screen.error}>{configError}</Text>
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-food" />
      <Stack.Screen name="new-food" />
      <Stack.Screen name="add-set" />
      <Stack.Screen name="new-lift" />
      <Stack.Screen name="new-group" />
      <Stack.Screen name="new-post" />
      <Stack.Screen name="edit-name" />
      <Stack.Screen name="edit-photo" />
      <Stack.Screen name="group/[id]" />
      <Stack.Screen name="member/[id]" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  )
}
