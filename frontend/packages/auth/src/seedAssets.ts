export const SEED_ASSETS_BUCKET = 'seed_assets'
export const LOGIN_PHOTO_OBJECT = 'login-photo.svg'

/** Public Storage URL for a seeded object. Works against local Supabase. */
export function getSeedAssetPublicUrl(
  objectPath: string = LOGIN_PHOTO_OBJECT,
  supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? '',
): string {
  const base = supabaseUrl.replace(/\/$/, '')
  if (!base) return ''
  return `${base}/storage/v1/object/public/${SEED_ASSETS_BUCKET}/${objectPath}`
}
