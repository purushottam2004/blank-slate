import { Tabs } from 'expo-router'

const accent = '#c2410c'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: '#a8a29e',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e7e5e4' },
      }}
    >
      <Tabs.Screen name="diet" options={{ title: 'Diet' }} />
      <Tabs.Screen name="lifts" options={{ title: 'Lifts' }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
      <Tabs.Screen name="posts" options={{ title: 'Posts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}
