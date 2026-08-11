-- Título editable de la bitácora por entorno
-- Pegá en Supabase → SQL Editor → Run

alter table environments
  add column if not exists bitacora_title text;

update environments
set bitacora_title = 'Bitácora del Equipo'
where bitacora_title is null or trim(bitacora_title) = '';

alter table environments
  alter column bitacora_title set default 'Bitácora del Equipo';

alter table environments
  alter column bitacora_title set not null;

-- Permitir que editor también actualice textos del entorno (p. ej. título)
drop policy if exists "environments update owner" on environments;
create policy "environments update member editor" on environments
  for update to authenticated
  using (public.environment_member_role(id) in ('owner', 'editor'))
  with check (public.environment_member_role(id) in ('owner', 'editor'));
