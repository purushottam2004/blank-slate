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
    if (session && onLogin) router.replace('/')
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
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="index" options={{ title: 'Home' }} />
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
