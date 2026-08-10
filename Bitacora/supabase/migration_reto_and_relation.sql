-- Migración: renombrar problema → reto + vínculo con actividad
-- Pegá en Supabase → SQL Editor → Run

-- 1) Permitir temporalmente ambos valores de type
alter table events drop constraint if exists events_type_check;

update events
set type = 'reto'
where type = 'problema';

alter table events
  add constraint events_type_check
  check (type in ('actividad', 'reto'));

-- 2) Relación reto → actividad (mismo entorno, validada en la app)
alter table events
  add column if not exists related_activity_id uuid references events (id) on delete set null;

create index if not exists events_related_activity_id_idx
  on events (related_activity_id);
