-- Migración: prioridad de eventos
-- Pegá en Supabase → SQL Editor → Run

alter table events
  add column if not exists priority text default 'media';

update events
set priority = 'media'
where priority is null or priority = '';

alter table events drop constraint if exists events_priority_check;
alter table events
  add constraint events_priority_check
  check (priority in ('alta', 'media', 'baja'));
