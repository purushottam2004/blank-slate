--IDEMPOTENT
-- Gym Rats: groups, foods, lifts, posts. Privileged changes go through
-- security-definer functions. Signed-in users cannot edit a food or a lift.

alter table public.users add column if not exists avatar_path text;

-- ---------------------------------------------------------------------------
-- Groups
-- ---------------------------------------------------------------------------

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  invite_code text not null unique,
  creator_id uuid not null references public.users (id),
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = gid
      and user_id = auth.uid()
  );
$$;

create or replace function public.shares_group(other_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid()
      and theirs.user_id = other_user
  );
$$;

create or replace function public.issue_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  n int;
  i int;
begin
  for n in 1..30 loop
    candidate := '';
    for i in 1..4 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    if not exists (select 1 from public.groups where invite_code = candidate) then
      return candidate;
    end if;
  end loop;
  raise exception 'could not issue an invite code';
end;
$$;

drop policy if exists "Members read their groups" on public.groups;
create policy "Members read their groups"
  on public.groups
  for select
  to authenticated
  using (public.is_group_member(id));

drop policy if exists "Members read their group members" on public.group_members;
create policy "Members read their group members"
  on public.group_members
  for select
  to authenticated
  using (public.is_group_member(group_id));

drop policy if exists "Members can view shared profiles" on public.users;
create policy "Members can view shared profiles"
  on public.users
  for select
  to authenticated
  using (id = auth.uid() or public.shares_group(id));

create or replace function public.create_group(p_name text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  created public.groups;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if char_length(btrim(p_name)) = 0 then
    raise exception 'a group needs a name';
  end if;
  insert into public.groups (name, invite_code, creator_id)
  values (btrim(p_name), public.issue_invite_code(), auth.uid())
  returning * into created;
  insert into public.group_members (group_id, user_id)
  values (created.id, auth.uid());
  return created;
end;
$$;

create or replace function public.join_group(p_code text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  matched public.groups;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  select * into matched
  from public.groups
  where invite_code = upper(btrim(p_code));
  if not found then
    raise exception 'that code does not match a group';
  end if;
  insert into public.group_members (group_id, user_id)
  values (matched.id, auth.uid())
  on conflict do nothing;
  return matched;
end;
$$;

create or replace function public.rename_group(p_group_id uuid, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if char_length(btrim(p_name)) = 0 then
    raise exception 'a group needs a name';
  end if;
  if not exists (
    select 1 from public.groups
    where id = p_group_id and creator_id = auth.uid()
  ) then
    raise exception 'only the creator can rename a group';
  end if;
  update public.groups
  set name = btrim(p_name)
  where id = p_group_id;
end;
$$;

create or replace function public.replace_invite_code(p_group_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_code text;
begin
  if not exists (
    select 1 from public.groups
    where id = p_group_id and creator_id = auth.uid()
  ) then
    raise exception 'only the creator can replace the code';
  end if;
  next_code := public.issue_invite_code();
  update public.groups
  set invite_code = next_code
  where id = p_group_id;
  return next_code;
end;
$$;

create or replace function public.remove_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id = auth.uid() then
    raise exception 'leave the group instead of removing yourself';
  end if;
  if not exists (
    select 1 from public.groups
    where id = p_group_id and creator_id = auth.uid()
  ) then
    raise exception 'only the creator can remove a member';
  end if;
  delete from public.group_members
  where group_id = p_group_id
    and user_id = p_user_id;
end;
$$;

create or replace function public.leave_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining int;
  was_creator boolean;
  next_creator uuid;
begin
  if not public.is_group_member(p_group_id) then
    raise exception 'you are not in that group';
  end if;
  select creator_id = auth.uid() into was_creator
  from public.groups
  where id = p_group_id;

  select count(*) - 1 into remaining
  from public.group_members
  where group_id = p_group_id;

  if remaining = 0 then
    delete from public.groups where id = p_group_id;
    return;
  end if;

  delete from public.group_members
  where group_id = p_group_id
    and user_id = auth.uid();

  if was_creator then
    select m.user_id into next_creator
    from public.group_members m
    join public.users u on u.id = m.user_id
    where m.group_id = p_group_id
    order by m.joined_at asc, u.created_at asc
    limit 1;
    update public.groups
    set creator_id = next_creator
    where id = p_group_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Foods and intakes
-- ---------------------------------------------------------------------------

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  measure text not null check (measure in ('g', 'ml')),
  basis text not null check (basis in ('per_100', 'per_kg')),
  created_at timestamptz not null default now(),
  check (basis = 'per_100' or measure = 'g')
);

create table if not exists public.food_nutrients (
  food_id uuid not null references public.foods (id) on delete cascade,
  nutrient_id uuid not null references public.nutrients (id) on delete restrict,
  amount numeric not null check (amount >= 0),
  primary key (food_id, nutrient_id)
);

create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete restrict,
  amount numeric not null check (amount > 0),
  logged_on date not null,
  created_at timestamptz not null default now()
);

alter table public.foods enable row level security;
alter table public.food_nutrients enable row level security;
alter table public.intakes enable row level security;

create or replace function public.reject_catalog_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'this cannot be changed after it is created';
end;
$$;

drop trigger if exists foods_reject_update on public.foods;
create trigger foods_reject_update
  before update on public.foods
  for each row
  execute function public.reject_catalog_update();

drop trigger if exists food_nutrients_reject_update on public.food_nutrients;
create trigger food_nutrients_reject_update
  before update on public.food_nutrients
  for each row
  execute function public.reject_catalog_update();

drop policy if exists "Read own foods and foods behind a visible intake" on public.foods;
create policy "Read own foods and foods behind a visible intake"
  on public.foods
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.intakes i
      where i.food_id = foods.id
        and public.shares_group(i.user_id)
    )
  );

drop policy if exists "Read nutrients of a visible food" on public.food_nutrients;
create policy "Read nutrients of a visible food"
  on public.food_nutrients
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.foods f
      where f.id = food_nutrients.food_id
        and (
          f.user_id = auth.uid()
          or exists (
            select 1
            from public.intakes i
            where i.food_id = f.id
              and public.shares_group(i.user_id)
          )
        )
    )
  );

drop policy if exists "Read own intakes and intakes of people you share a group with" on public.intakes;
create policy "Read own intakes and intakes of people you share a group with"
  on public.intakes
  for select
  to authenticated
  using (user_id = auth.uid() or public.shares_group(user_id));

drop policy if exists "Log your own intake" on public.intakes;
create policy "Log your own intake"
  on public.intakes
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.foods f
      where f.id = food_id and f.user_id = auth.uid()
    )
  );

drop policy if exists "Change your own intake" on public.intakes;
create policy "Change your own intake"
  on public.intakes
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.foods f
      where f.id = food_id and f.user_id = auth.uid()
    )
  );

drop policy if exists "Delete your own intake" on public.intakes;
create policy "Delete your own intake"
  on public.intakes
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.create_food(
  p_name text,
  p_measure text,
  p_basis text,
  p_nutrients jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  food_id uuid;
  item record;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if p_measure not in ('g', 'ml') or p_basis not in ('per_100', 'per_kg') then
    raise exception 'measure or basis is not valid';
  end if;
  if p_basis = 'per_kg' and p_measure <> 'g' then
    raise exception 'per kilogram is only for grams';
  end if;
  if char_length(btrim(p_name)) = 0 then
    raise exception 'a food needs a name';
  end if;

  insert into public.foods (user_id, name, measure, basis)
  values (auth.uid(), btrim(p_name), p_measure, p_basis)
  returning id into food_id;

  for item in
    select nutrient_id, amount
    from jsonb_to_recordset(coalesce(p_nutrients, '[]'::jsonb))
      as x(nutrient_id uuid, amount numeric)
  loop
    if item.amount is null or item.amount < 0 then
      raise exception 'a nutrient amount cannot be negative';
    end if;
    insert into public.food_nutrients (food_id, nutrient_id, amount)
    values (food_id, item.nutrient_id, item.amount);
  end loop;

  return food_id;
end;
$$;

create or replace function public.delete_food(p_food_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.foods
    where id = p_food_id and user_id = auth.uid()
  ) then
    raise exception 'food not found';
  end if;
  if exists (select 1 from public.intakes where food_id = p_food_id) then
    raise exception 'a food that has been logged cannot be deleted';
  end if;
  delete from public.foods where id = p_food_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lifts and sets
-- ---------------------------------------------------------------------------

create table if not exists public.lifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  lift_id uuid not null references public.lifts (id) on delete restrict,
  logged_on date not null,
  attempt int not null check (attempt >= 1),
  reps int not null check (reps >= 1),
  load_kg numeric not null check (load_kg >= 0),
  created_at timestamptz not null default now()
);

alter table public.lifts enable row level security;
alter table public.sets enable row level security;

drop trigger if exists lifts_reject_update on public.lifts;
create trigger lifts_reject_update
  before update on public.lifts
  for each row
  execute function public.reject_catalog_update();

drop policy if exists "Read own lifts and lifts behind a visible set" on public.lifts;
create policy "Read own lifts and lifts behind a visible set"
  on public.lifts
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.sets s
      where s.lift_id = lifts.id
        and public.shares_group(s.user_id)
    )
  );

drop policy if exists "Define your own lift" on public.lifts;
create policy "Define your own lift"
  on public.lifts
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Delete an unused lift" on public.lifts;
create policy "Delete an unused lift"
  on public.lifts
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Read own sets and sets of people you share a group with" on public.sets;
create policy "Read own sets and sets of people you share a group with"
  on public.sets
  for select
  to authenticated
  using (user_id = auth.uid() or public.shares_group(user_id));

drop policy if exists "Log your own set" on public.sets;
create policy "Log your own set"
  on public.sets
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lifts l
      where l.id = lift_id and l.user_id = auth.uid()
    )
  );

drop policy if exists "Change your own set" on public.sets;
create policy "Change your own set"
  on public.sets
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lifts l
      where l.id = lift_id and l.user_id = auth.uid()
    )
  );

drop policy if exists "Delete your own set" on public.sets;
create policy "Delete your own set"
  on public.sets
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  body text,
  image_path text,
  created_at timestamptz not null default now(),
  check (
    (body is not null and char_length(btrim(body)) > 0)
    or image_path is not null
  )
);

create table if not exists public.post_audiences (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  kind text not null check (kind in ('profile', 'group')),
  group_id uuid references public.groups (id) on delete cascade,
  check (
    (kind = 'profile' and group_id is null)
    or (kind = 'group' and group_id is not null)
  )
);

create unique index if not exists post_audiences_one_profile
  on public.post_audiences (post_id)
  where kind = 'profile';

create unique index if not exists post_audiences_one_group
  on public.post_audiences (post_id, group_id)
  where kind = 'group';

alter table public.posts enable row level security;
alter table public.post_audiences enable row level security;

create or replace function public.can_see_post(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = p_post_id
      and (
        p.user_id = auth.uid()
        or (
          exists (
            select 1 from public.post_audiences a
            where a.post_id = p.id and a.kind = 'profile'
          )
          and public.shares_group(p.user_id)
        )
        or exists (
          select 1
          from public.post_audiences a
          join public.group_members author_member
            on author_member.group_id = a.group_id
           and author_member.user_id = p.user_id
          where a.post_id = p.id
            and a.kind = 'group'
            and public.is_group_member(a.group_id)
        )
      )
  );
$$;

drop policy if exists "Read a post you are allowed to see" on public.posts;
create policy "Read a post you are allowed to see"
  on public.posts
  for select
  to authenticated
  using (public.can_see_post(id));

drop policy if exists "Publish your own post" on public.posts;
create policy "Publish your own post"
  on public.posts
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Edit your own post" on public.posts;
create policy "Edit your own post"
  on public.posts
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Delete your own post" on public.posts;
create policy "Delete your own post"
  on public.posts
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Read audiences of a visible post" on public.post_audiences;
create policy "Read audiences of a visible post"
  on public.post_audiences
  for select
  to authenticated
  using (public.can_see_post(post_id));

drop policy if exists "Author adds an audience" on public.post_audiences;
create policy "Author adds an audience"
  on public.post_audiences
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
    and (group_id is null or public.is_group_member(group_id))
  );

drop policy if exists "Author removes an audience" on public.post_audiences;
create policy "Author removes an audience"
  on public.post_audiences
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Photos
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('post-images', 'post-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "Public read post images" on storage.objects;
create policy "Public read post images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'post-images');

drop policy if exists "Users upload their own avatars" on storage.objects;
create policy "Users upload their own avatars"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users upload their own post images" on storage.objects;
create policy "Users upload their own post images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Execute
-- ---------------------------------------------------------------------------

revoke all on function public.is_group_member(uuid) from public;
revoke all on function public.shares_group(uuid) from public;
revoke all on function public.issue_invite_code() from public;
revoke all on function public.can_see_post(uuid) from public;
revoke all on function public.create_group(text) from public;
revoke all on function public.join_group(text) from public;
revoke all on function public.rename_group(uuid, text) from public;
revoke all on function public.replace_invite_code(uuid) from public;
revoke all on function public.remove_member(uuid, uuid) from public;
revoke all on function public.leave_group(uuid) from public;
revoke all on function public.create_food(text, text, text, jsonb) from public;
revoke all on function public.delete_food(uuid) from public;

grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.shares_group(uuid) to authenticated;
grant execute on function public.can_see_post(uuid) to authenticated;
grant execute on function public.create_group(text) to authenticated;
grant execute on function public.join_group(text) to authenticated;
grant execute on function public.rename_group(uuid, text) to authenticated;
grant execute on function public.replace_invite_code(uuid) to authenticated;
grant execute on function public.remove_member(uuid, uuid) to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.create_food(text, text, text, jsonb) to authenticated;
grant execute on function public.delete_food(uuid) to authenticated;
