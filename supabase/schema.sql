-- Fresh-project schema. Do not run over existing tables; use a migration instead.
begin;

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0)
);
create unique index brands_name_unique on public.brands (lower(trim(name)));

create table public.paint_types (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0)
);
create unique index paint_types_name_unique on public.paint_types (lower(trim(name)));

create table public.paints (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  type_id uuid not null references public.paint_types(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  code text,
  color text check (color ~ '^#[0-9A-Fa-f]{6}$')
);
create unique index paints_brand_type_name_unique on public.paints (brand_id, type_id, lower(trim(name)));
create index paints_type_id_idx on public.paints (type_id);

-- Snapshots preserve offline and pre-catalogue personal entries; these never add
-- records to the shared catalogue.
create table public.user_paints (
  user_id uuid not null references auth.users(id) on delete cascade,
  paint_id text not null,
  paint jsonb not null,
  status text not null check (status in ('owned', 'wishlist', 'none')),
  updated_at timestamptz not null,
  primary key (user_id, paint_id),
  check (jsonb_typeof(paint) = 'object' and paint ? 'id' and paint ->> 'id' is not null and paint ->> 'id' = paint_id)
);

alter table public.brands enable row level security;
alter table public.paint_types enable row level security;
alter table public.paints enable row level security;
alter table public.user_paints enable row level security;

revoke all on public.brands, public.paint_types, public.paints, public.user_paints from anon, authenticated;
grant select on public.brands, public.paint_types, public.paints to anon, authenticated;
grant select, insert, update on public.user_paints to authenticated;

create policy "Anyone can read brands" on public.brands for select to anon, authenticated using (true);
create policy "Anyone can read paint types" on public.paint_types for select to anon, authenticated using (true);
create policy "Anyone can read paints" on public.paints for select to anon, authenticated using (true);
create policy "Users can read their own paints" on public.user_paints
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own paints" on public.user_paints
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own paints" on public.user_paints
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
