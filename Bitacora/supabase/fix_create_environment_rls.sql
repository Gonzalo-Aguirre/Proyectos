-- Fix rápido: crear entornos fallaba por RLS en INSERT…RETURNING
-- Pegá en Supabase → SQL Editor → Run

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

drop policy if exists "environments select member" on environments;
create policy "environments select member" on environments
  for select to authenticated
  using (
    public.is_environment_member(id)
    or created_by_user_id = auth.uid()
  );

drop policy if exists "members insert owner" on environment_members;
drop policy if exists "members insert owner_or_self_owner" on environment_members;
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

-- Sembrar owners que falten (entornos huérfanos tras el cambio de RLS)
insert into environment_members (environment_id, user_id, role)
select e.id, e.created_by_user_id, 'owner'
from environments e
where e.created_by_user_id is not null
on conflict (environment_id, user_id) do nothing;
