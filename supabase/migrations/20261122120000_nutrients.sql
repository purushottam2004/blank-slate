--IDEMPOTENT
-- Global nutrient list. Rows are seeded locally and inserted by hand in prod.
-- Authenticated users may read them. They cannot insert, update, or delete them.

create table if not exists public.nutrients (
  id uuid primary key,
  name text not null unique,
  unit text not null,
  created_at timestamptz not null default now()
);

alter table public.nutrients enable row level security;

drop policy if exists "Signed-in users can read nutrients" on public.nutrients;
create policy "Signed-in users can read nutrients"
  on public.nutrients
  for select
  to authenticated
  using (true);
