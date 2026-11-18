-- Admin import/export: extends admin_add_paints to carry range, finish, medium and size_ml,
-- and to update existing paints when an item includes their "id" (from the CSV export).
-- Run after migration_admin.sql and migration_inventory.sql. Safe to re-run.
--
-- Items are {brand, type, name, code, color, range, finish, medium, size_ml, id?}.
--   * With "id": the paint is updated. Only keys present in the item are changed;
--     a present but empty value clears the field.
--   * Without "id": the paint is added, or skipped if brand + type + name already exist.
-- Returns {added, updated, skipped}. Any error rolls back the whole import.
begin;

create or replace function public.admin_add_paints(items jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  item jsonb;
  total int;
  added int := 0;
  updated int := 0;
  n int;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 or jsonb_array_length(items) > 5000 then
    raise exception 'Provide between 1 and 5000 paints';
  end if;
  total := jsonb_array_length(items);

  if exists (
    select 1 from jsonb_array_elements(items) i
    where coalesce(trim(i->>'brand'), '') = '' or coalesce(trim(i->>'type'), '') = '' or coalesce(trim(i->>'name'), '') = ''
       or (nullif(trim(i->>'color'), '') is not null and trim(i->>'color') !~ '^#[0-9A-Fa-f]{6}$')
       or (nullif(trim(i->>'finish'), '') is not null and trim(i->>'finish') not in ('Matte', 'Satin', 'Gloss', 'Metallic'))
       or (nullif(trim(i->>'medium'), '') is not null and trim(i->>'medium') not in ('Acrylic', 'Wash/Shade', 'Ink', 'Airbrush', 'Varnish'))
       or (nullif(trim(i->>'size_ml'), '') is not null and trim(i->>'size_ml') !~ '^[0-9]+(\.[0-9]+)?$')
       or (nullif(trim(i->>'size_ml'), '') is not null and trim(i->>'size_ml') ~ '^[0-9]+(\.[0-9]+)?$' and (trim(i->>'size_ml'))::numeric <= 0)
       or (nullif(trim(i->>'id'), '') is not null and trim(i->>'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  ) then
    raise exception 'Every paint needs a brand, type and name; colours must look like #RRGGBB; finish, medium and size_ml must be valid';
  end if;

  insert into public.brands (name)
  select distinct on (lower(trim(i->>'brand'))) trim(i->>'brand') from jsonb_array_elements(items) i
  on conflict ((lower(trim(name)))) do nothing;
  insert into public.paint_types (name)
  select distinct on (lower(trim(i->>'type'))) trim(i->>'type') from jsonb_array_elements(items) i
  on conflict ((lower(trim(name)))) do nothing;

  for item in select * from jsonb_array_elements(items) loop
    if nullif(trim(item->>'id'), '') is not null then
      if not exists (select 1 from public.paints where id = (trim(item->>'id'))::uuid) then
        raise exception 'Paint id % was not found', trim(item->>'id');
      end if;
      begin
        update public.paints p set
          brand_id = b.id,
          type_id = t.id,
          name = trim(item->>'name'),
          code = case when item ? 'code' then nullif(trim(item->>'code'), '') else p.code end,
          color = case when item ? 'color' then nullif(trim(item->>'color'), '') else p.color end,
          range = case when item ? 'range' then nullif(trim(item->>'range'), '') else p.range end,
          finish = case when item ? 'finish' then nullif(trim(item->>'finish'), '') else p.finish end,
          medium = case when item ? 'medium' then nullif(trim(item->>'medium'), '') else p.medium end,
          size_ml = case when item ? 'size_ml' then nullif(trim(item->>'size_ml'), '')::numeric else p.size_ml end
        from public.brands b, public.paint_types t
        where p.id = (trim(item->>'id'))::uuid
          and lower(trim(b.name)) = lower(trim(item->>'brand'))
          and lower(trim(t.name)) = lower(trim(item->>'type'))
          and (p.brand_id, p.type_id, p.name, p.code, p.color, p.range, p.finish, p.medium, p.size_ml) is distinct from
              (b.id, t.id, trim(item->>'name'),
               case when item ? 'code' then nullif(trim(item->>'code'), '') else p.code end,
               case when item ? 'color' then nullif(trim(item->>'color'), '') else p.color end,
               case when item ? 'range' then nullif(trim(item->>'range'), '') else p.range end,
               case when item ? 'finish' then nullif(trim(item->>'finish'), '') else p.finish end,
               case when item ? 'medium' then nullif(trim(item->>'medium'), '') else p.medium end,
               case when item ? 'size_ml' then nullif(trim(item->>'size_ml'), '')::numeric else p.size_ml end);
        get diagnostics n = row_count;
        updated := updated + n;
      exception when unique_violation then
        raise exception 'Cannot update "%": another paint already has that brand, type and name', trim(item->>'name');
      end;
    else
      insert into public.paints (brand_id, type_id, name, code, color, range, finish, medium, size_ml)
      select b.id, t.id, trim(item->>'name'), nullif(trim(item->>'code'), ''), nullif(trim(item->>'color'), ''),
             nullif(trim(item->>'range'), ''), nullif(trim(item->>'finish'), ''), nullif(trim(item->>'medium'), ''),
             nullif(trim(item->>'size_ml'), '')::numeric
      from public.brands b, public.paint_types t
      where lower(trim(b.name)) = lower(trim(item->>'brand')) and lower(trim(t.name)) = lower(trim(item->>'type'))
      on conflict (brand_id, type_id, (lower(trim(name)))) do nothing;
      get diagnostics n = row_count;
      added := added + n;
    end if;
  end loop;

  return jsonb_build_object('added', added, 'updated', updated, 'skipped', total - added - updated);
end $$;

revoke all on function public.admin_add_paints(jsonb) from public, anon;
grant execute on function public.admin_add_paints(jsonb) to authenticated;

commit;
