import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { HelloButton } from '../components/HelloButton'
import { screen } from '../components/screenStyles'

export default function HomeScreen() {
  const { session, signOut } = useAuth()

  return (
    <SafeAreaView style={screen.page}>
      <View>
        <Text style={screen.title}>React Native</Text>
        <Text style={screen.body}>Signed in as {session?.user.email}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => void signOut()}
        style={[screen.button, screen.secondaryButton]}
      >
        <Text style={screen.secondaryButtonText}>Sign out</Text>
      </Pressable>
      <View>
        <Text style={screen.title}>Backend</Text>
        <Text style={screen.body}>Call the authenticated /api/v1/hello endpoint.</Text>
      </View>
      <HelloButton />
    </SafeAreaView>
  )
}
