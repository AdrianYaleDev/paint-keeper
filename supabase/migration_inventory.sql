-- Pot lifecycle and richer paint metadata. Safe to re-run.
alter table public.paints add column if not exists range text;
alter table public.paints add column if not exists finish text
  check (finish is null or finish in ('Matte', 'Satin', 'Gloss', 'Metallic'));
alter table public.paints add column if not exists medium text
  check (medium is null or medium in ('Acrylic', 'Wash/Shade', 'Ink', 'Airbrush', 'Varnish'));
alter table public.paints add column if not exists size_ml numeric
  check (size_ml is null or size_ml > 0);

alter table public.user_paints add column if not exists condition text
  check (condition is null or condition in ('low', 'dried'));
alter table public.user_paints add column if not exists restock boolean not null default false;
