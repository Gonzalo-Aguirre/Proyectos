-- Bitácora del Equipo — schema completo
-- Pegá TODO en Supabase → SQL Editor → Run

create extension if not exists "pgcrypto";

-- Perfiles (se completan al entrar con Google)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Entornos de trabajo (lugares / contextos de actividad)
create table if not exists environments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text default '' not null,
  created_by text not null,
  created_by_user_id uuid references profiles (id) on delete set null
);

-- Eventos de la bitácora (siempre dentro de un entorno)
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  environment_id uuid not null references environments (id) on delete cascade,
  created_by text not null,
  created_by_user_id uuid references profiles (id) on delete set null,
  type text not null check (type in ('actividad', 'reto')),
  title text not null,
  description text not null,
  resolution text,
  involved text[] default '{}',
  tags text[] default '{}',
  status text default 'terminada' check (
    status in ('por_iniciar', 'en_progreso', 'terminada', 'abierto', 'resuelto')
  ),
  priority text default 'media' check (priority in ('alta', 'media', 'baja')),
  status_changed_by text,
  status_changed_at timestamp with time zone,
  related_activity_id uuid references events (id) on delete set null
);

create index if not exists events_environment_id_idx on events (environment_id);
create index if not exists events_created_at_idx on events (created_at desc);
create index if not exists events_related_activity_id_idx on events (related_activity_id);

-- Items de seguimiento (avances) dentro de un evento
create table if not exists event_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_id uuid not null references events (id) on delete cascade,
  body text not null,
  created_by text not null,
  created_by_user_id uuid references profiles (id) on delete set null
);

create index if not exists event_items_event_id_idx on event_items (event_id);
create index if not exists event_items_created_at_idx on event_items (created_at asc);

-- Membresías e invitaciones (compartir entornos)
create table if not exists environment_members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  environment_id uuid not null references environments (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  unique (environment_id, user_id)
);

create index if not exists environment_members_user_id_idx
  on environment_members (user_id);
create index if not exists environment_members_environment_id_idx
  on environment_members (environment_id);

create table if not exists environment_invites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  environment_id uuid not null references environments (id) on delete cascade,
  email text not null,
  role text not null check (role in ('editor', 'viewer')),
  token text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid not null references profiles (id) on delete cascade,
  expires_at timestamp with time zone
);

create index if not exists environment_invites_email_idx
  on environment_invites (email);
create index if not exists environment_invites_environment_id_idx
  on environment_invites (environment_id);

create or replace function public.handle_new_environment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by_user_id is not null then
    insert into public.environment_members (environment_id, user_id, role)
    values (new.id, new.created_by_user_id, 'owner')
    on conflict (environment_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_environment_created on environments;
create trigger on_environment_created
  after insert on environments
  for each row execute function public.handle_new_environment();

create or replace function public.accept_environment_invite(invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.environment_invites%rowtype;
  user_email text;
begin
  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if user_email = '' then
    raise exception 'No hay email en la sesión';
  end if;

  select * into inv
  from public.environment_invites
  where id = invite_id
  for update;

  if not found then
    raise exception 'Invitación no encontrada';
  end if;
  if inv.status <> 'pending' then
    raise exception 'La invitación ya no está pendiente';
  end if;
  if lower(inv.email) <> user_email then
    raise exception 'Esta invitación es para otro email';
  end if;
  if inv.expires_at is not null and inv.expires_at < timezone('utc'::text, now()) then
    raise exception 'La invitación expiró';
  end if;

  insert into public.environment_members (environment_id, user_id, role)
  values (inv.environment_id, auth.uid(), inv.role)
  on conflict (environment_id, user_id) do update
    set role = excluded.role;

  update public.environment_invites
  set status = 'accepted'
  where id = invite_id;
end;
$$;

grant execute on function public.accept_environment_invite(uuid) to authenticated;

create or replace function public.is_environment_member(env_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.environment_members m
    where m.environment_id = env_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.environment_member_role(env_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select m.role
  from public.environment_members m
  where m.environment_id = env_id
    and m.user_id = auth.uid()
  limit 1;
$$;

alter table profiles enable row level security;
alter table environments enable row level security;
alter table events enable row level security;
alter table event_items enable row level security;
alter table environment_members enable row level security;
alter table environment_invites enable row level security;

drop policy if exists "profiles read authenticated" on profiles;
create policy "profiles read authenticated" on profiles
  for select to authenticated using (true);

drop policy if exists "profiles upsert own" on profiles;
create policy "profiles upsert own" on profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "environments all authenticated" on environments;
drop policy if exists "environments select member" on environments;
drop policy if exists "environments insert authenticated" on environments;
drop policy if exists "environments update owner" on environments;
drop policy if exists "environments delete owner" on environments;

create policy "environments select member" on environments
  for select to authenticated
  using (
    public.is_environment_member(id)
    or created_by_user_id = auth.uid()
  );

create policy "environments insert authenticated" on environments
  for insert to authenticated
  with check (auth.uid() = created_by_user_id);

create policy "environments update owner" on environments
  for update to authenticated
  using (public.environment_member_role(id) = 'owner')
  with check (public.environment_member_role(id) = 'owner');

create policy "environments delete owner" on environments
  for delete to authenticated
  using (public.environment_member_role(id) = 'owner');

drop policy if exists "events all authenticated" on events;
drop policy if exists "events select member" on events;
drop policy if exists "events write editor" on events;

create policy "events select member" on events
  for select to authenticated
  using (public.is_environment_member(environment_id));

create policy "events write editor" on events
  for all to authenticated
  using (
    public.environment_member_role(environment_id) in ('owner', 'editor')
  )
  with check (
    public.environment_member_role(environment_id) in ('owner', 'editor')
  );

drop policy if exists "event_items all authenticated" on event_items;
drop policy if exists "event_items select member" on event_items;
drop policy if exists "event_items write editor" on event_items;

create policy "event_items select member" on event_items
  for select to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and public.is_environment_member(e.environment_id)
    )
  );

create policy "event_items write editor" on event_items
  for all to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and public.environment_member_role(e.environment_id) in ('owner', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and public.environment_member_role(e.environment_id) in ('owner', 'editor')
    )
  );

drop policy if exists "members select member" on environment_members;
drop policy if exists "members insert owner" on environment_members;
drop policy if exists "members delete manage" on environment_members;
drop policy if exists "members update owner" on environment_members;

create policy "members select member" on environment_members
  for select to authenticated
  using (public.is_environment_member(environment_id));

create policy "members insert owner" on environment_members
  for insert to authenticated
  with check (
    public.environment_member_role(environment_id) = 'owner'
    or (
      user_id = auth.uid()
      and role = 'owner'
      and exists (
        select 1
        from public.environments e
        where e.id = environment_id
          and e.created_by_user_id = auth.uid()
      )
    )
  );

create policy "members delete manage" on environment_members
  for delete to authenticated
  using (
    user_id = auth.uid()
    or public.environment_member_role(environment_id) = 'owner'
  );

create policy "members update owner" on environment_members
  for update to authenticated
  using (public.environment_member_role(environment_id) = 'owner')
  with check (public.environment_member_role(environment_id) = 'owner');

drop policy if exists "invites select related" on environment_invites;
drop policy if exists "invites insert owner" on environment_invites;
drop policy if exists "invites update related" on environment_invites;

create policy "invites select related" on environment_invites
  for select to authenticated
  using (
    public.environment_member_role(environment_id) = 'owner'
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "invites insert owner" on environment_invites
  for insert to authenticated
  with check (
    public.environment_member_role(environment_id) = 'owner'
    and invited_by = auth.uid()
  );

create policy "invites update related" on environment_invites
  for update to authenticated
  using (
    public.environment_member_role(environment_id) = 'owner'
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    public.environment_member_role(environment_id) = 'owner'
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Al registrarse con Google, crear/actualizar perfil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'usuario'), '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
