-- Vallejo Game Color catalogue, accessed 2026-11-13:
-- https://acrylicosvallejo.com/en/category/hobby/game-color-en/
-- https://acrylicosvallejo.com/en/hobby-color-charts/
-- https://acrylicosvallejo.com/wp-content/uploads/2025/09/CC266-Game_Color.pdf
--
-- Product names and dotted codes come from the manufacturer's individual
-- product listings (pages 1-8). Game Color inks, washes and FX are separate
-- sub-ranges because the listing contains products with identical names.
-- Swatches come from the manufacturer's chart, matched by code: solid vector
-- swatches or rendered fluorescent artwork. They are digital approximations,
-- not physical measurements. FX and large washes lack a reliable chart swatch.
-- No Xpress Color, Game Air, sets or other Vallejo ranges are included.
-- Reruns only fill NULL codes/colours and never replace existing values or IDs.
-- Conflicting product codes abort the transaction for manual review.
begin;

insert into public.brands (name) values ('Vallejo')
on conflict ((lower(trim(name)))) do nothing;

insert into public.paint_types (name)
values ('Game Color'), ('Game Color Ink'), ('Game Color Wash'), ('Game Color FX')
on conflict ((lower(trim(name)))) do nothing;

create temporary table vallejo_seed (
  type_name text not null,
  paint_name text not null,
  code text not null unique,
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  primary key (type_name, paint_name)
) on commit drop;

-- Rows are (range, manufacturer product name, product code, approximate colour).
insert into vallejo_seed (type_name, paint_name, code, color) values
  ('Game Color', 'Dead White', '72.001', '#FFFFFF'),
  ('Game Color', 'Off-White', '72.101', '#FDEDB1'),
  ('Game Color', 'Elfic Flesh', '72.098', '#ECCF9D'),
  ('Game Color', 'Bone White', '72.034', '#CCC4A3'),
  ('Game Color', 'Pale Flesh', '72.003', '#C9967A'),
  ('Game Color', 'Rosy Flesh', '72.100', '#E27666'),
  ('Game Color', 'Athena Skin', '72.107', '#AD6458'),
  ('Game Color', 'Succubus Skin', '72.108', '#714743'),
  ('Game Color', 'Skin Tone', '72.099', '#F9AD7F'),
  ('Game Color', 'Elf Skin Tone', '72.004', '#BD7B56'),
  ('Game Color', 'Barbarian Skin', '72.071', '#705944'),
  ('Game Color', 'Toxic Yellow', '72.109', '#DDC149'),
  ('Game Color', 'Moon Yellow', '72.005', '#EDB524'),
  ('Game Color', 'Sun Yellow', '72.006', '#F89624'),
  ('Game Color', 'Gold Yellow', '72.007', '#EA7D27'),
  ('Game Color', 'Scrofulous Brown', '72.038', '#A25F24'),
  ('Game Color', 'Sunset Orange', '72.110', '#F6863C'),
  ('Game Color', 'Orange Fire', '72.008', '#F15F2B'),
  ('Game Color', 'Hot Orange', '72.009', '#DD3B2A'),
  ('Game Color', 'Scarlet Blood', '72.106', '#AA2427'),
  ('Game Color', 'Bloody Red', '72.010', '#A92323'),
  ('Game Color', 'Scarlet Red', '72.012', '#521224'),
  ('Game Color', 'Gory Red', '72.011', '#5C0E16'),
  ('Game Color', 'Nocturnal Red', '72.111', '#330C17'),
  ('Game Color', 'Evil Red', '72.112', '#2D1123'),
  ('Game Color', 'Squid Pink', '72.013', '#C6719F'),
  ('Game Color', 'Warlord Purple', '72.014', '#7B2446'),
  ('Game Color', 'Deep Magenta', '72.113', '#461331'),
  ('Game Color', 'Lustful Purple', '72.114', '#725C91'),
  ('Game Color', 'Alien Purple', '72.076', '#4C417F'),
  ('Game Color', 'Hexed Lichen', '72.015', '#2E0F3A'),
  ('Game Color', 'Royal Purple', '72.016', '#1A0E30'),
  ('Game Color', 'Midnight Purple', '72.116', '#1A0531'),
  ('Game Color', 'Elfic Blue', '72.117', '#3E5D7A'),
  ('Game Color', 'Ultramarine Blue', '72.022', '#081E4D'),
  ('Game Color', 'Night Blue', '72.019', '#000119'),
  ('Game Color', 'Sunrise Blue', '72.118', '#53B8DD'),
  ('Game Color', 'Electric Blue', '72.023', '#017088'),
  ('Game Color', 'Magic Blue', '72.021', '#0B4584'),
  ('Game Color', 'Imperial Blue', '72.020', '#021B32'),
  ('Game Color', 'Verdigris', '72.096', '#7AC9AA'),
  ('Game Color', 'Aquamarine', '72.119', '#007C7A'),
  ('Game Color', 'Turquoise', '72.024', '#004247'),
  ('Game Color', 'Abyssal Turquoise', '72.120', '#001F32'),
  ('Game Color', 'Ghost Green', '72.121', '#54BE90'),
  ('Game Color', 'Foul Green', '72.025', '#086D54'),
  ('Game Color', 'Jade Green', '72.026', '#004939'),
  ('Game Color', 'Scurvy Green', '72.027', '#003324'),
  ('Game Color', 'Bile Green', '72.122', '#CDDC33'),
  ('Game Color', 'Scorpy Green', '72.032', '#437E3E'),
  ('Game Color', 'Goblin Green', '72.030', '#3E4E2C'),
  ('Game Color', 'Sick Green', '72.029', '#395C38'),
  ('Game Color', 'Angel Green', '72.123', '#1A3722'),
  ('Game Color', 'Dark Green', '72.028', '#011F13'),
  ('Game Color', 'Dead Flesh', '72.035', '#87783E'),
  ('Game Color', 'Camouflage Green', '72.031', '#68602F'),
  ('Game Color', 'Dirty Grey', '72.145', '#423B20'),
  ('Game Color', 'Cayman Green', '72.067', '#383518'),
  ('Game Color', 'Khaki', '72.061', '#6D5C46'),
  ('Game Color', 'Desert Yellow', '72.063', '#765C33'),
  ('Game Color', 'Earth', '72.062', '#4F3B26'),
  ('Game Color', 'Bronze Brown', '72.036', '#925C27'),
  ('Game Color', 'Plague Brown', '72.039', '#865B2B'),
  ('Game Color', 'Leather Brown', '72.040', '#463010'),
  ('Game Color', 'Beasty Brown', '72.043', '#4E361D'),
  ('Game Color', 'Parasite Brown', '72.042', '#683C1F'),
  ('Game Color', 'Grunge Brown', '72.115', '#62361F'),
  ('Game Color', 'Gorgon Brown', '72.124', '#371C14'),
  ('Game Color', 'Tan', '72.066', '#774E44'),
  ('Game Color', 'Dark Fleshtone', '72.044', '#3A1811'),
  ('Game Color', 'Charred Brown', '72.045', '#1F110F'),
  ('Game Color', 'Wolf Grey', '72.047', '#8BAFB6'),
  ('Game Color', 'Glacier Blue', '72.095', '#A7C7E7'),
  ('Game Color', 'Steel Grey', '72.102', '#40535D'),
  ('Game Color', 'Sombre Grey', '72.048', '#303D44'),
  ('Game Color', 'Warm Grey', '72.148', '#77615D'),
  ('Game Color', 'Stonewall Grey', '72.049', '#565555'),
  ('Game Color', 'Neutral Grey', '72.050', '#3F4342'),
  ('Game Color', 'Charcoal', '72.155', '#080B07'),
  ('Game Color', 'Black', '72.051', '#000000'),
  ('Game Color', 'Silver', '72.052', '#A9B3B4'),
  ('Game Color', 'Chainmail', '72.053', '#8B939B'),
  ('Game Color', 'Dark Gunmetal', '72.054', '#696E73'),
  ('Game Color', 'Polished Gold', '72.055', '#E1B233'),
  ('Game Color', 'Glorious Gold', '72.056', '#D08432'),
  ('Game Color', 'Bright Bronze', '72.057', '#9F5818'),
  ('Game Color', 'Brassy Brass', '72.058', '#AA6B46'),
  ('Game Color', 'Hammered Copper', '72.059', '#6D4A35'),
  ('Game Color', 'Tinny Tin', '72.060', '#4C2B18'),
  ('Game Color Ink', 'White', '72.082', '#FFFFFF'),
  ('Game Color Ink', 'Skin', '72.093', '#3F1A17'),
  ('Game Color Ink', 'Yellow', '72.085', '#E99B2B'),
  ('Game Color Ink', 'Red', '72.086', '#A5172A'),
  ('Game Color Ink', 'Magenta', '72.083', '#98274B'),
  ('Game Color Ink', 'Violet', '72.087', '#473462'),
  ('Game Color Ink', 'Blue', '72.088', '#0A3A6B'),
  ('Game Color Ink', 'Dark Turquoise', '72.084', '#003D3B'),
  ('Game Color Ink', 'Green', '72.089', '#08743C'),
  ('Game Color Ink', 'Black Green', '72.090', '#1A3729'),
  ('Game Color Ink', 'Sepia', '72.091', '#2C210F'),
  ('Game Color Ink', 'Black', '72.094', '#000000'),
  ('Game Color', 'Fluorescent Yellow', '72.103', '#FAEB3D'),
  ('Game Color', 'Fluorescent Orange', '72.156', '#E63C11'),
  ('Game Color', 'Fluorescent Red', '72.157', '#E42E3F'),
  ('Game Color', 'Fluorescent Magenta', '72.158', '#E8348B'),
  ('Game Color', 'Fluorescent Violet', '72.159', '#6E257A'),
  ('Game Color', 'Fluorescent Blue', '72.160', '#007AB9'),
  ('Game Color', 'Fluorescent Green', '72.104', '#5AB030'),
  ('Game Color', 'Fluorescent Cold Green', '72.161', '#00604E'),
  ('Game Color Wash', 'Yellow Wash', '73.208', '#F0E908'),
  ('Game Color Wash', 'Flesh Wash', '73.204', '#926152'),
  ('Game Color Wash', 'Red Wash', '73.206', '#BF2426'),
  ('Game Color Wash', 'Violet Wash', '73.209', '#6B2F8A'),
  ('Game Color Wash', 'Blue Wash', '73.207', '#0C72BA'),
  ('Game Color Wash', 'Umber Wash', '73.203', '#5C493C'),
  ('Game Color Wash', 'Sepia Wash', '73.200', '#5B421B'),
  ('Game Color Wash', 'Black Wash', '73.201', '#2B2C33'),
  ('Game Color FX', 'Vomit', '72.600', null),
  ('Game Color FX', 'Fresh Blood', '72.601', null),
  ('Game Color FX', 'Thick Blood', '72.602', null),
  ('Game Color FX', 'Demon Blood', '72.603', null),
  ('Game Color FX', 'Frost', '72.604', null),
  ('Game Color FX', 'Green Rust', '72.605', null),
  ('Game Color FX', 'Bile', '72.606', null),
  ('Game Color FX', 'Acid', '72.607', null),
  ('Game Color FX', 'Corrosion', '72.608', null),
  ('Game Color FX', 'Rust', '72.609', null),
  ('Game Color FX', 'Galvanic Corrosion', '72.610', null),
  ('Game Color FX', 'Moss and Lichen', '72.611', null),
  ('Game Color Wash', 'Sepia', '73.300', null),
  ('Game Color Wash', 'Negro', '73.301', null);

do $$
begin
  if exists (
    select 1
    from vallejo_seed s
    join public.brands b on lower(trim(b.name)) = 'vallejo'
    join public.paint_types t on lower(trim(t.name)) = lower(trim(s.type_name))
    join public.paints p on p.brand_id = b.id and p.type_id = t.id
      and lower(trim(p.name)) = lower(trim(s.paint_name))
    where p.code is not null and lower(trim(p.code)) <> lower(trim(s.code))
  ) or exists (
    select 1
    from vallejo_seed s
    join public.brands b on lower(trim(b.name)) = 'vallejo'
    join public.paints p on p.brand_id = b.id and lower(trim(p.code)) = lower(trim(s.code))
    join public.paint_types t on t.id = p.type_id
    where lower(trim(t.name)) <> lower(trim(s.type_name))
       or lower(trim(p.name)) <> lower(trim(s.paint_name))
  ) then
    raise exception 'A Vallejo paint conflicts with a seed product code. Review existing records before importing.';
  end if;
end $$;

insert into public.paints (brand_id, type_id, name, code, color)
select b.id, t.id, s.paint_name, s.code, s.color
from vallejo_seed s
join public.brands b on lower(trim(b.name)) = 'vallejo'
join public.paint_types t on lower(trim(t.name)) = lower(trim(s.type_name))
on conflict (brand_id, type_id, (lower(trim(name)))) do update
set code = coalesce(paints.code, excluded.code),
    color = coalesce(paints.color, excluded.color)
where (paints.code is null and excluded.code is not null)
   or (paints.color is null and excluded.color is not null);

commit;
