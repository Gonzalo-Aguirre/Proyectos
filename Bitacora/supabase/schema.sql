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
  type text not null check (type in ('actividad', 'problema')),
  title text not null,
  description text not null,
  resolution text,
  involved text[] default '{}',
  tags text[] default '{}',
  status text default 'terminada' check (
    status in ('por_iniciar', 'en_progreso', 'terminada', 'abierto', 'resuelto')
  ),
  status_changed_by text,
  status_changed_at timestamp with time zone
);

create index if not exists events_environment_id_idx on events (environment_id);
create index if not exists events_created_at_idx on events (created_at desc);

alter table profiles enable row level security;
alter table environments enable row level security;
alter table events enable row level security;

-- Herramienta interna: acceso amplio para usuarios autenticados
drop policy if exists "profiles read authenticated" on profiles;
create policy "profiles read authenticated" on profiles
  for select to authenticated using (true);

drop policy if exists "profiles upsert own" on profiles;
create policy "profiles upsert own" on profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "environments all authenticated" on environments;
create policy "environments all authenticated" on environments
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "events all authenticated" on events;
create policy "events all authenticated" on events
  for all to authenticated
  using (true)
  with check (true);

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
