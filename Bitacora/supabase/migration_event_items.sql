-- Migración: items de seguimiento por evento
-- Pegá en Supabase → SQL Editor → Run (si ya tenías el schema anterior)

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

alter table event_items enable row level security;

drop policy if exists "event_items all authenticated" on event_items;
create policy "event_items all authenticated" on event_items
  for all to authenticated
  using (true)
  with check (true);
