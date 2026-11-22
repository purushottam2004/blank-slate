import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../auth/AuthProvider'
import { screen } from '../../components/screenStyles'
import { deletePost, loadGroups, loadPosts, publicImageUrl, type Post } from '../../lib/gym'

export default function PostsScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [nextPosts, groups] = await Promise.all([loadPosts(), loadGroups()])
      setPosts(nextPosts)
      setNames(Object.fromEntries(groups.map((group) => [group.id, group.name])))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load posts')
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  return (
    <SafeAreaView style={screen.page}>
      <View style={screen.dayRow}>
        <Text style={screen.title}>Posts</Text>
        <Pressable onPress={() => router.push('/new-post')}>
          <Text style={screen.addText}>New</Text>
        </Pressable>
      </View>
      {error ? <Text style={screen.error}>{error}</Text> : null}
      {posts.map((post) => {
        const audience = post.audiences
          .map((item) => (item.kind === 'profile' ? 'Profile' : names[item.group_id ?? ''] ?? 'Group'))
          .join(' · ')
        const image = publicImageUrl('post-images', post.image_path)
        return (
          <Pressable
            key={post.id}
            disabled={post.user_id !== session?.user.id}
            onPress={() => void deletePost(post.id).then(load)}
            style={{ gap: 8 }}
          >
            {image ? (
              <Image source={{ uri: image }} style={{ height: 220, borderRadius: 16, backgroundColor: '#e7e5e4' }} />
            ) : null}
            {post.body ? <Text style={screen.rowTitle}>{post.body}</Text> : null}
            <Text style={screen.muted}>
              {post.author.display_name ?? 'Unnamed'}
              {audience ? ` · ${audience}` : ''}
            </Text>
          </Pressable>
        )
      })}
      <Text style={screen.muted}>Tap your own post to delete it.</Text>
    </SafeAreaView>
  )
}
