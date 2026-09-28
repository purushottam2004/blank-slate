--IDEMPOTENT
-- Public example bucket for seeded demo assets (login photo, etc.).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'seed_assets',
  'seed_assets',
  true,
  1048576,
  array['image/svg+xml', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read seed_assets" on storage.objects;

create policy "Public read seed_assets"
  on storage.objects
  for select
  to public
  using (bucket_id = 'seed_assets');
