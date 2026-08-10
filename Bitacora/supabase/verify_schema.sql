-- Verificación: ¿la base coincide con la app actual?
-- Pegá en Supabase → SQL Editor → Run y revisá el resultado.

-- 1) Columnas de events
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'events'
order by ordinal_position;

-- 2) ¿Existen las columnas nuevas?
select
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'priority'
  ) as tiene_priority,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'related_activity_id'
  ) as tiene_related_activity_id,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'event_items'
  ) as tiene_event_items;

-- 3) Constraints de type / status / priority
select conname, pg_get_constraintdef(oid) as definicion
from pg_constraint
where conrelid = 'public.events'::regclass
  and contype = 'c'
order by conname;

-- 4) Columnas de event_items
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'event_items'
order by ordinal_position;

-- 5) Valores type actuales (no debería haber 'problema')
select type, count(*) as cantidad
from public.events
group by type
order by type;

-- 6) Valores priority (debería ser alta/media/baja o vacío solo si faltó el update)
select coalesce(priority, '(null)') as priority, count(*) as cantidad
from public.events
group by priority
order by priority;

-- 7) Sharing: tablas y memberships
select
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'environment_members'
  ) as tiene_environment_members,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'environment_invites'
  ) as tiene_environment_invites;

select role, count(*) as cantidad
from public.environment_members
group by role
order by role;
