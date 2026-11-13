-- Partial TTCombat catalogue. Sources accessed 2026-11-13:
-- https://ttcombat.com/products/ttcombat-core-paint-set
-- https://ttcombat.com/collections/paints/products/ttcombat-starter-paint-set
-- https://ttcombat.com/collections/ttcombat/paint-range_ttcombat-paints
-- https://ttcombat.com/collections/paints/colour_metallic?page=2
-- https://ttcombat.com/collections/paints/products/washes-set
-- https://ttcombat.com/collections/paints/products/ttcombat-candy-coats-set
-- https://ttcombat.com/collections/ttcombat/type_auxiliary
-- https://ttcombat.com/collections/paints
-- https://ttcombat.com/collections/paints/products/admiralty-grey
--
-- Categories describe product use, even though several are acrylic-based.
-- The core set misspells Admiralty Grey; its individual listing confirms this
-- spelling. Add verified codes and hex colours to the rows below; use NULL
-- when unknown. Existing non-NULL codes and colours are never overwritten.
--
-- This transaction fills missing codes and colours on reruns. If a paint in this seed
-- already exists under a different type, it aborts rather than create a duplicate
-- or change the ID/type behind anyone's collection. Resolve that case separately.
begin;

insert into public.brands (name)
values ('TTCombat')
on conflict ((lower(trim(name)))) do nothing;

insert into public.paint_types (name)
values ('Acrylic'), ('Metallic'), ('Wash'), ('Candy Coat'),
       ('Effect'), ('Medium'), ('Spray')
on conflict ((lower(trim(name)))) do nothing;

create temporary table ttcombat_seed (
  type_name text not null,
  paint_name text not null,
  code text,
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  primary key (type_name, paint_name)
) on commit drop;

-- Each row is (type, name, code, colour). For example:
-- ('Acrylic', 'White', 'YOUR-CODE', '#FFFFFF')
-- The example is illustrative, not a verified TTCombat code or swatch.
insert into ttcombat_seed (type_name, paint_name, code, color) values
  ('Acrylic', 'White', null, null),
  ('Acrylic', 'Black', null, null),
  ('Acrylic', 'Dark Slate Grey', null, null),
  ('Acrylic', 'Laser Cut Brown', null, null),
  ('Acrylic', 'Adriatic Skin', null, null),
  ('Acrylic', 'Blue Genesis', null, null),
  ('Acrylic', 'Ash Grey', null, null),
  ('Acrylic', 'Shale Grey', null, null),
  ('Acrylic', 'Anubti Flesh', null, null),
  ('Acrylic', 'Poster Boy Blue', null, null),
  ('Acrylic', 'Light Azure Blue', null, null),
  ('Acrylic', 'Shadowling Grey', null, null),
  ('Acrylic', 'Trench Mud', null, null),
  ('Acrylic', 'Phantom Ivory', null, null),
  ('Acrylic', 'Troll Skin Blue', null, null),
  ('Acrylic', 'Admiralty Grey', null, null),
  ('Acrylic', 'Frosted Edge', null, null),
  ('Acrylic', 'Mummified Khaki', null, null),
  ('Acrylic', 'Kings Blood Blue', null, null),
  ('Acrylic', 'Vega Bluegrey', null, null),
  ('Acrylic', 'Amazonian Green', null, null),
  ('Acrylic', 'Stagnant Pond Green', null, null),
  ('Acrylic', 'Canal Green', null, null),
  ('Acrylic', 'Jotunheim Teal', null, null),
  ('Acrylic', 'Jungle Shadow Green', null, null),
  ('Acrylic', 'Mantis Green', null, null),
  ('Acrylic', 'Pistachio Green', null, null),
  ('Acrylic', 'Trihorn Turquoise', null, null),
  ('Acrylic', 'Reef Rager Teal', null, null),
  ('Acrylic', 'White Knuckle Flesh', null, null),
  ('Acrylic', 'Buttercup Yellow', null, null),
  ('Acrylic', 'Khepri Sunshine Yellow', null, null),
  ('Acrylic', 'Port Red', null, null),
  ('Acrylic', 'Rumble Skin', null, null),
  ('Acrylic', 'Halfling Skin', null, null),
  ('Acrylic', 'Spotlight Yellow', null, null),
  ('Acrylic', 'Pitaya Pink', null, null),
  ('Acrylic', 'Forbidden Fuchsia', null, null),
  ('Acrylic', 'Blood Orange', null, null),
  ('Acrylic', 'Mahogany Red', null, null),
  ('Acrylic', 'Terracotta', null, null),
  ('Acrylic', 'Oxblood Red', null, null),
  ('Acrylic', 'Boo Yeah! Orange', null, null),
  ('Acrylic', 'Apricot', null, null),
  ('Acrylic', 'Briefcase Leather Red', null, null),
  ('Acrylic', 'Viscera Red', null, null),
  ('Acrylic', 'Go Faster Red', null, null),
  ('Acrylic', 'Succulent Green', null, null),
  ('Acrylic', 'EAA Blue', null, null),
  ('Acrylic', 'Capo Red', null, null),
  ('Acrylic', 'Crypt Bone', null, null),
  ('Acrylic', 'Matt Brown', null, null),
  ('Acrylic', 'Nautical Blue', null, null),
  ('Metallic', 'Gunmetal', null, null),
  ('Metallic', 'Ducat Gold', null, null),
  ('Metallic', 'Heatsink Bronze', null, null),
  ('Metallic', 'Counterfit Gold', null, null),
  ('Metallic', 'Supernova Chrome', null, null),
  ('Wash', 'Black Wash', null, null),
  ('Wash', 'Umber Wash', null, null),
  ('Wash', 'Blue Wash', null, null),
  ('Wash', 'Gold Wash', null, null),
  ('Wash', 'Flesh Wash', null, null),
  ('Wash', 'Purple Wash', null, null),
  ('Wash', 'Red Wash', null, null),
  ('Wash', 'Sienna Wash', null, null),
  ('Wash', 'Yellow Wash', null, null),
  ('Wash', 'Warm Green Wash', null, null),
  ('Candy Coat', 'Sphalerite Yellow', null, null),
  ('Candy Coat', 'Ruby Red', null, null),
  ('Candy Coat', 'Citrine Yellow', null, null),
  ('Candy Coat', 'Tourmaline Pink', null, null),
  ('Candy Coat', 'Sapphire Blue', null, null),
  ('Candy Coat', 'Onyx Black', null, null),
  ('Candy Coat', 'Topaz Blue', null, null),
  ('Candy Coat', 'Idocrase Green', null, null),
  ('Candy Coat', 'Aragonite Orange', null, null),
  ('Candy Coat', 'Emerald Green', null, null),
  ('Effect', 'Spilled Blood', null, null),
  ('Effect', 'Old Rust', null, null),
  ('Effect', 'Verdigris', null, null),
  ('Medium', 'Thinning Medium', null, null),
  ('Medium', 'Glaze Medium', null, null),
  ('Spray', 'Matt Brown Spray Primer', null, null),
  ('Spray', 'Spotlight Yellow Spray Primer', null, null),
  ('Spray', 'Frosted Edge Spray Primer', null, null),
  ('Spray', 'Colonial Green Spray Primer', null, null),
  ('Spray', 'Poster Boy Blue Spray Primer', null, null),
  ('Spray', 'Capo Red Spray Primer', null, null),
  ('Spray', 'Phantom Ivory Spray Primer', null, null),
  ('Spray', 'Admiralty Grey Spray Primer', null, null),
  ('Spray', 'White V2 Spray Primer', null, null),
  ('Spray', 'Black V2 Spray Primer', null, null);

do $$
begin
  if exists (
    select 1
    from ttcombat_seed s
    join public.brands b on lower(trim(b.name)) = 'ttcombat'
    join public.paints p on p.brand_id = b.id and lower(trim(p.name)) = lower(trim(s.paint_name))
    join public.paint_types t on t.id = p.type_id
    where lower(trim(t.name)) <> lower(trim(s.type_name))
  ) then
    raise exception 'A TTCombat paint already exists under a different type. Review existing records before importing.';
  end if;
end $$;

insert into public.paints (brand_id, type_id, name, code, color)
select b.id, t.id, s.paint_name, s.code, s.color
from ttcombat_seed s
join public.brands b on lower(trim(b.name)) = 'ttcombat'
join public.paint_types t on lower(trim(t.name)) = lower(trim(s.type_name))
on conflict (brand_id, type_id, (lower(trim(name)))) do update
set code = coalesce(paints.code, excluded.code),
    color = coalesce(paints.color, excluded.color)
where (paints.code is null and excluded.code is not null)
   or (paints.color is null and excluded.color is not null);

commit;
