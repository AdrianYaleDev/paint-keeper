-- Admin area: lets listed admins add paints to the shared catalogue.
-- Run once in the Supabase SQL editor, then add yourself as an admin:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
begin;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;
drop policy if exists "Admins can read their own row" on public.admins;
create policy "Admins can read their own row" on public.admins
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;

-- Takes a jsonb array of {brand, type, name, code, color}. Missing brands and types
-- are created; paints that already exist (same brand, type and name) are skipped.
create or replace function public.admin_add_paints(items jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  added int;
  total int;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 or jsonb_array_length(items) > 5000 then
    raise exception 'Provide between 1 and 5000 paints';
  end if;

  create temporary table pending on commit drop as
  select trim(i->>'brand') as brand, trim(i->>'type') as type, trim(i->>'name') as name,
         nullif(trim(i->>'code'), '') as code, nullif(trim(i->>'color'), '') as color
  from jsonb_array_elements(items) i;
  total := (select count(*) from pending);

  if exists (select 1 from pending where coalesce(brand, '') = '' or coalesce(type, '') = '' or coalesce(name, '') = ''
             or (color is not null and color !~ '^#[0-9A-Fa-f]{6}$')) then
    raise exception 'Every paint needs a brand, type and name, and colours must look like #RRGGBB';
  end if;

  insert into public.brands (name)
  select distinct on (lower(brand)) brand from pending
  on conflict ((lower(trim(name)))) do nothing;
  insert into public.paint_types (name)
  select distinct on (lower(type)) type from pending
  on conflict ((lower(trim(name)))) do nothing;

  with ins as (
    insert into public.paints (brand_id, type_id, name, code, color)
    select distinct on (b.id, t.id, lower(p.name)) b.id, t.id, p.name, p.code, p.color
    from pending p
    join public.brands b on lower(trim(b.name)) = lower(p.brand)
    join public.paint_types t on lower(trim(t.name)) = lower(p.type)
    on conflict (brand_id, type_id, (lower(trim(name)))) do nothing
    returning 1
  )
  select count(*) into added from ins;

  return jsonb_build_object('added', added, 'skipped', total - added);
end $$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.admin_add_paints(jsonb) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_add_paints(jsonb) to authenticated;

commit;
