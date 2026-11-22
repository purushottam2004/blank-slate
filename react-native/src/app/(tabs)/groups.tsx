import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../auth/AuthProvider'
import { screen } from '../../components/screenStyles'
import { joinGroup, loadGroups, loadMembers, type Group, type Member } from '../../lib/gym'

export default function GroupsScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<Record<string, Member[]>>({})
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const next = await loadGroups()
      const lists = await Promise.all(next.map(async (group) => [group.id, await loadMembers(group.id)] as const))
      setGroups(next)
      setMembers(Object.fromEntries(lists))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load groups')
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  async function join() {
    try {
      await joinGroup(code)
      setCode('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <View style={screen.dayRow}>
        <Text style={screen.title}>Groups</Text>
        <Pressable onPress={() => router.push('/new-group')}>
          <Text style={screen.addText}>New</Text>
        </Pressable>
      </View>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <View style={screen.card}>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setCode}
          placeholder="Invite code"
          style={screen.input}
          value={code}
        />
        <Pressable onPress={() => void join()} style={screen.add}>
          <Text style={screen.addText}>Join with code</Text>
        </Pressable>
      </View>
      {groups.map((group) => (
        <View key={group.id} style={{ gap: 8 }}>
          <Pressable onPress={() => router.push({ pathname: '/group/[id]', params: { id: group.id } })} style={screen.codeCard}>
            <Text style={screen.muted}>{group.name}</Text>
            <Text style={screen.codeValue}>{group.invite_code}</Text>
          </Pressable>
          <View style={screen.card}>
            {(members[group.id] ?? []).map((member, index) => (
              <Pressable
                key={member.id}
                disabled={member.id === session?.user.id}
                onPress={() => router.push({ pathname: '/member/[id]', params: { id: member.id } })}
                style={[screen.row, index === 0 && screen.rowFirst]}
              >
                <Text style={screen.rowTitle}>{member.display_name ?? 'Unnamed'}</Text>
                {member.id === group.creator_id ? <Text style={screen.muted}>Creator</Text> : null}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </SafeAreaView>
  )
}
