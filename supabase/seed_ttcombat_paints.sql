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
-- https://ttcombat.com/collections/ttcombat/products.json?limit=250
-- https://ttcombat.com/collections/ttcombat-aerosols/products.json?limit=250
--
-- Categories describe product use, even though several are acrylic-based.
-- The core set misspells Admiralty Grey; its individual listing confirms this
-- spelling. Swatches are approximate digital samples from the product artwork
-- (painted dice for bottles, coloured dots for sprays), not measured paint
-- colours. Lighting, metallic finishes and transparency affect their appearance.
-- Mediums and products without a matching image remain NULL. Add verified codes
-- when available. Existing non-NULL codes and colours are never overwritten.
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
  ('Acrylic', 'White', null, '#FFFFFF'),
  ('Acrylic', 'Black', null, '#000000'),
  ('Acrylic', 'Dark Slate Grey', null, '#525254'),
  ('Acrylic', 'Laser Cut Brown', null, '#251613'),
  ('Acrylic', 'Adriatic Skin', null, '#BA9265'),
  ('Acrylic', 'Blue Genesis', null, '#1091C4'),
  ('Acrylic', 'Ash Grey', null, '#778085'),
  ('Acrylic', 'Shale Grey', null, '#9C9DA2'),
  ('Acrylic', 'Anubti Flesh', null, '#633E31'),
  ('Acrylic', 'Poster Boy Blue', null, '#003993'),
  ('Acrylic', 'Light Azure Blue', null, '#6BC2E5'),
  ('Acrylic', 'Shadowling Grey', null, '#23282A'),
  ('Acrylic', 'Trench Mud', null, '#57442D'),
  ('Acrylic', 'Phantom Ivory', null, '#F1F1E2'),
  ('Acrylic', 'Troll Skin Blue', null, '#06467B'),
  ('Acrylic', 'Admiralty Grey', null, '#656C71'),
  ('Acrylic', 'Frosted Edge', null, '#CED8D1'),
  ('Acrylic', 'Mummified Khaki', null, '#908576'),
  ('Acrylic', 'Kings Blood Blue', null, '#3F4A61'),
  ('Acrylic', 'Vega Bluegrey', null, '#386885'),
  ('Acrylic', 'Amazonian Green', null, '#3B7639'),
  ('Acrylic', 'Stagnant Pond Green', null, '#3B4127'),
  ('Acrylic', 'Canal Green', null, '#5D6450'),
  ('Acrylic', 'Jotunheim Teal', null, '#009499'),
  ('Acrylic', 'Jungle Shadow Green', null, '#153918'),
  ('Acrylic', 'Mantis Green', null, '#7CAA48'),
  ('Acrylic', 'Pistachio Green', null, '#98B79C'),
  ('Acrylic', 'Trihorn Turquoise', null, '#015062'),
  ('Acrylic', 'Reef Rager Teal', null, '#41B3BA'),
  ('Acrylic', 'White Knuckle Flesh', null, '#FFE9E9'),
  ('Acrylic', 'Buttercup Yellow', null, '#EFC725'),
  ('Acrylic', 'Khepri Sunshine Yellow', null, '#FEEC7B'),
  ('Acrylic', 'Port Red', null, '#78395E'),
  ('Acrylic', 'Rumble Skin', null, '#A46343'),
  ('Acrylic', 'Halfling Skin', null, '#FFD3B0'),
  ('Acrylic', 'Spotlight Yellow', null, '#FFAD28'),
  ('Acrylic', 'Pitaya Pink', null, '#8E4162'),
  ('Acrylic', 'Forbidden Fuchsia', null, null),
  ('Acrylic', 'Blood Orange', null, '#E01B03'),
  ('Acrylic', 'Mahogany Red', null, '#674140'),
  ('Acrylic', 'Terracotta', null, '#A55953'),
  ('Acrylic', 'Oxblood Red', null, '#6C393E'),
  ('Acrylic', 'Boo Yeah! Orange', null, '#FF6C00'),
  ('Acrylic', 'Apricot', null, '#D58D51'),
  ('Acrylic', 'Briefcase Leather Red', null, '#99342A'),
  ('Acrylic', 'Viscera Red', null, '#A60716'),
  ('Acrylic', 'Go Faster Red', null, '#B13C3A'),
  ('Acrylic', 'Succulent Green', null, '#304F14'),
  ('Acrylic', 'EAA Blue', null, '#1E7DE7'),
  ('Acrylic', 'Capo Red', null, '#680914'),
  ('Acrylic', 'Crypt Bone', null, '#EAE2D0'),
  ('Acrylic', 'Matt Brown', null, '#5F3B1A'),
  ('Acrylic', 'Nautical Blue', null, '#465277'),
  ('Metallic', 'Gunmetal', null, '#2E271D'),
  ('Metallic', 'Ducat Gold', null, '#BC742B'),
  ('Metallic', 'Heatsink Bronze', null, '#D4835B'),
  ('Metallic', 'Counterfit Gold', null, '#A3732A'),
  ('Metallic', 'Supernova Chrome', null, '#575757'),
  ('Wash', 'Black Wash', null, '#666666'),
  ('Wash', 'Umber Wash', null, '#6D6459'),
  ('Wash', 'Blue Wash', null, '#5C667D'),
  ('Wash', 'Gold Wash', null, '#8C6D3E'),
  ('Wash', 'Flesh Wash', null, '#937663'),
  ('Wash', 'Purple Wash', null, '#736C87'),
  ('Wash', 'Red Wash', null, '#7B5257'),
  ('Wash', 'Sienna Wash', null, '#9F8169'),
  ('Wash', 'Yellow Wash', null, '#D9A04B'),
  ('Wash', 'Warm Green Wash', null, '#817651'),
  ('Candy Coat', 'Sphalerite Yellow', null, '#DBC367'),
  ('Candy Coat', 'Ruby Red', null, '#60342E'),
  ('Candy Coat', 'Citrine Yellow', null, '#D8B935'),
  ('Candy Coat', 'Tourmaline Pink', null, '#964679'),
  ('Candy Coat', 'Sapphire Blue', null, '#5166A8'),
  ('Candy Coat', 'Onyx Black', null, '#37332E'),
  ('Candy Coat', 'Topaz Blue', null, '#5C91B5'),
  ('Candy Coat', 'Idocrase Green', null, '#66713C'),
  ('Candy Coat', 'Aragonite Orange', null, '#9B3F26'),
  ('Candy Coat', 'Emerald Green', null, '#709047'),
  ('Effect', 'Spilled Blood', null, '#692327'),
  ('Effect', 'Old Rust', null, '#3A2624'),
  ('Effect', 'Verdigris', null, '#007B7F'),
  ('Medium', 'Thinning Medium', null, null),
  ('Medium', 'Glaze Medium', null, null),
  ('Spray', 'Matt Brown Spray Primer', null, '#452613'),
  ('Spray', 'Spotlight Yellow Spray Primer', null, '#EDCD30'),
  ('Spray', 'Frosted Edge Spray Primer', null, '#DFDED8'),
  ('Spray', 'Colonial Green Spray Primer', null, '#354D19'),
  ('Spray', 'Poster Boy Blue Spray Primer', null, '#1B366C'),
  ('Spray', 'Capo Red Spray Primer', null, '#832714'),
  ('Spray', 'Phantom Ivory Spray Primer', null, '#E1DDD6'),
  ('Spray', 'Admiralty Grey Spray Primer', null, '#6E7282'),
  ('Spray', 'White V2 Spray Primer', null, '#FFFFFF'),
  ('Spray', 'Black V2 Spray Primer', null, '#000000');

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
