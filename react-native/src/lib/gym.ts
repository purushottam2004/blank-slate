import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabase'

function db(): SupabaseClient {
  return getSupabaseClient()
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

export type Measure = 'g' | 'ml'
export type Basis = 'per_100' | 'per_kg'

export type Profile = {
  id: string
  display_name: string | null
  avatar_path: string | null
}

export type Nutrient = {
  id: string
  name: string
  unit: string
}

export type Food = {
  id: string
  name: string
  measure: Measure
  basis: Basis
}

export type Intake = {
  id: string
  amount: number
  logged_on: string
  food: Food
}

export type Lift = {
  id: string
  name: string
}

export type SetLog = {
  id: string
  attempt: number
  reps: number
  load_kg: number
  logged_on: string
  lift: Lift
}

export type Group = {
  id: string
  name: string
  invite_code: string
  creator_id: string
}

export type Member = Profile & { joined_at: string }

export type Audience = {
  id: string
  kind: 'profile' | 'group'
  group_id: string | null
}

export type Post = {
  id: string
  user_id: string
  body: string | null
  image_path: string | null
  created_at: string
  author: Profile
  audiences: Audience[]
}

export function publicImageUrl(bucket: 'avatars' | 'post-images', path: string | null): string | null {
  if (!path) return null
  return db().storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function loadProfile(userId: string): Promise<Profile> {
  const { data, error } = await db()
    .from('users')
    .select('id, display_name, avatar_path')
    .eq('id', userId)
    .single()
  fail(error)
  return data as Profile
}

export async function saveDisplayName(userId: string, name: string): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('A display name is required')
  const { error } = await db().from('users').update({ display_name: trimmed }).eq('id', userId)
  fail(error)
}

export async function saveAvatarPath(userId: string, path: string): Promise<void> {
  const { error } = await db().from('users').update({ avatar_path: path }).eq('id', userId)
  fail(error)
}

export async function loadNutrients(): Promise<Nutrient[]> {
  const { data, error } = await db().from('nutrients').select('id, name, unit').order('name')
  fail(error)
  return (data ?? []) as Nutrient[]
}

export async function loadFoods(): Promise<Food[]> {
  const { data, error } = await db()
    .from('foods')
    .select('id, name, measure, basis')
    .order('name')
  fail(error)
  return (data ?? []) as Food[]
}

export async function createFood(input: {
  name: string
  measure: Measure
  basis: Basis
  nutrients: { nutrient_id: string; amount: number }[]
}): Promise<string> {
  const { data, error } = await db().rpc('create_food', {
    p_name: input.name,
    p_measure: input.measure,
    p_basis: input.basis,
    p_nutrients: input.nutrients,
  })
  fail(error)
  return data as string
}

export async function loadIntakes(userId: string, day: string): Promise<Intake[]> {
  const { data, error } = await db()
    .from('intakes')
    .select('id, amount, logged_on, food:foods!intakes_food_id_fkey(id, name, measure, basis)')
    .eq('user_id', userId)
    .eq('logged_on', day)
    .order('created_at')
  fail(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    amount: Number(row.amount),
    logged_on: row.logged_on as string,
    food: row.food as unknown as Food,
  }))
}

export async function logIntake(foodId: string, amount: number, day: string): Promise<void> {
  const { data: userData, error: userError } = await db().auth.getUser()
  fail(userError)
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')
  const { error } = await db().from('intakes').insert({
    user_id: userId,
    food_id: foodId,
    amount,
    logged_on: day,
  })
  fail(error)
}

export async function deleteIntake(id: string): Promise<void> {
  const { error } = await db().from('intakes').delete().eq('id', id)
  fail(error)
}

export async function loadLifts(): Promise<Lift[]> {
  const { data, error } = await db().from('lifts').select('id, name').order('name')
  fail(error)
  return (data ?? []) as Lift[]
}

export async function createLift(name: string): Promise<void> {
  const { data: userData, error: userError } = await db().auth.getUser()
  fail(userError)
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')
  const { error } = await db().from('lifts').insert({ user_id: userId, name: name.trim() })
  fail(error)
}

export async function loadSets(userId: string, day: string): Promise<SetLog[]> {
  const { data, error } = await db()
    .from('sets')
    .select('id, attempt, reps, load_kg, logged_on, lift:lifts!sets_lift_id_fkey(id, name)')
    .eq('user_id', userId)
    .eq('logged_on', day)
    .order('created_at')
  fail(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    attempt: row.attempt as number,
    reps: row.reps as number,
    load_kg: Number(row.load_kg),
    logged_on: row.logged_on as string,
    lift: row.lift as unknown as Lift,
  }))
}

export async function logSet(input: {
  liftId: string
  day: string
  attempt: number
  reps: number
  loadKg: number
}): Promise<void> {
  const { data: userData, error: userError } = await db().auth.getUser()
  fail(userError)
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')
  const { error } = await db().from('sets').insert({
    user_id: userId,
    lift_id: input.liftId,
    logged_on: input.day,
    attempt: input.attempt,
    reps: input.reps,
    load_kg: input.loadKg,
  })
  fail(error)
}

export async function deleteSet(id: string): Promise<void> {
  const { error } = await db().from('sets').delete().eq('id', id)
  fail(error)
}

export async function loadGroups(): Promise<Group[]> {
  const { data, error } = await db()
    .from('groups')
    .select('id, name, invite_code, creator_id')
    .order('created_at')
  fail(error)
  return (data ?? []) as Group[]
}

export async function loadMembers(groupId: string): Promise<Member[]> {
  const { data, error } = await db()
    .from('group_members')
    .select('joined_at, user:users!group_members_user_id_fkey(id, display_name, avatar_path)')
    .eq('group_id', groupId)
    .order('joined_at')
  fail(error)
  return (data ?? []).map((row) => {
    const user = row.user as unknown as Profile
    return { ...user, joined_at: row.joined_at as string }
  })
}

export async function createGroup(name: string): Promise<Group> {
  const { data, error } = await db().rpc('create_group', { p_name: name })
  fail(error)
  return data as Group
}

export async function joinGroup(code: string): Promise<void> {
  const { error } = await db().rpc('join_group', { p_code: code })
  fail(error)
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  const { error } = await db().rpc('rename_group', { p_group_id: groupId, p_name: name })
  fail(error)
}

export async function replaceInviteCode(groupId: string): Promise<string> {
  const { data, error } = await db().rpc('replace_invite_code', { p_group_id: groupId })
  fail(error)
  return data as string
}

export async function removeMember(groupId: string, userId: string): Promise<void> {
  const { error } = await db().rpc('remove_member', { p_group_id: groupId, p_user_id: userId })
  fail(error)
}

export async function leaveGroup(groupId: string): Promise<void> {
  const { error } = await db().rpc('leave_group', { p_group_id: groupId })
  fail(error)
}

export async function loadPosts(): Promise<Post[]> {
  const { data, error } = await db()
    .from('posts')
    .select(
      'id, user_id, body, image_path, created_at, author:users!posts_user_id_fkey(id, display_name, avatar_path), audiences:post_audiences(id, kind, group_id)',
    )
    .order('created_at', { ascending: false })
  fail(error)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    user_id: row.user_id as string,
    body: (row.body as string | null) ?? null,
    image_path: (row.image_path as string | null) ?? null,
    created_at: row.created_at as string,
    author: row.author as unknown as Profile,
    audiences: (row.audiences ?? []) as Audience[],
  }))
}

export async function createPost(input: {
  body: string
  imagePath: string | null
  profile: boolean
  groupIds: string[]
}): Promise<void> {
  const text = input.body.trim()
  if (!text && !input.imagePath) throw new Error('A post needs text or a photo')
  const { data: userData, error: userError } = await db().auth.getUser()
  fail(userError)
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')
  const { data, error } = await db()
    .from('posts')
    .insert({ user_id: userId, body: text || null, image_path: input.imagePath })
    .select('id')
    .single()
  fail(error)
  if (!data) throw new Error('Could not create the post')
  const postId = data.id as string
  const rows = [
    ...(input.profile ? [{ post_id: postId, kind: 'profile', group_id: null }] : []),
    ...input.groupIds.map((groupId) => ({ post_id: postId, kind: 'group', group_id: groupId })),
  ]
  if (rows.length === 0) return
  const { error: audienceError } = await db().from('post_audiences').insert(rows)
  fail(audienceError)
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await db().from('posts').delete().eq('id', id)
  fail(error)
}

export async function uploadImage(
  bucket: 'avatars' | 'post-images',
  userId: string,
  uri: string,
): Promise<string> {
  const response = await fetch(uri)
  const bytes = await response.arrayBuffer()
  const path = `${userId}/${crypto.randomUUID()}.jpg`
  const { error } = await db().storage.from(bucket).upload(path, bytes, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  fail(error)
  return path
}
