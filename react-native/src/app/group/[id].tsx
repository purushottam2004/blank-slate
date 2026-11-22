import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../auth/AuthProvider'
import { screen } from '../../components/screenStyles'
import {
  leaveGroup,
  loadGroups,
  loadMembers,
  removeMember,
  renameGroup,
  replaceInviteCode,
  type Group,
  type Member,
} from '../../lib/gym'

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuth()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const groups = await loadGroups()
      const found = groups.find((item) => item.id === id) ?? null
      setGroup(found)
      setName(found?.name ?? '')
      setMembers(await loadMembers(id))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load group')
    }
  }, [id])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const creator = group?.creator_id === session?.user.id

  async function run(action: () => Promise<void>) {
    try {
      await action()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the group')
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <Pressable onPress={() => router.back()}>
        <Text style={screen.addText}>Back</Text>
      </Pressable>
      <View style={screen.codeCard}>
        <Text style={screen.muted}>{group?.name ?? 'Group'}</Text>
        <Text style={screen.codeValue}>{group?.invite_code}</Text>
      </View>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      <View style={screen.card}>
        {members.map((member, index) => (
          <Pressable
            key={member.id}
            onPress={() => router.push({ pathname: '/member/[id]', params: { id: member.id } })}
            style={[screen.row, index === 0 && screen.rowFirst]}
          >
            <Text style={screen.rowTitle}>{member.display_name ?? 'Unnamed'}</Text>
            {creator && member.id !== session?.user.id ? (
              <Pressable onPress={() => void run(() => removeMember(id, member.id))}>
                <Text style={screen.error}>Remove</Text>
              </Pressable>
            ) : null}
          </Pressable>
        ))}
      </View>
      {creator ? (
        <>
          <Text style={screen.label}>Rename</Text>
          <TextInput onChangeText={setName} style={screen.input} value={name} />
          <Pressable onPress={() => void run(() => renameGroup(id, name))} style={screen.save}>
            <Text style={screen.buttonText}>Save name</Text>
          </Pressable>
          <Pressable onPress={() => void run(async () => void (await replaceInviteCode(id)))} style={screen.button}>
            <Text style={screen.buttonText}>Replace code</Text>
          </Pressable>
        </>
      ) : null}
      <Pressable
        onPress={() =>
          void leaveGroup(id)
            .then(() => router.back())
            .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not leave'))
        }
        style={screen.secondaryButton}
      >
        <Text style={screen.secondaryButtonText}>Leave group</Text>
      </Pressable>
    </SafeAreaView>
  )
}
