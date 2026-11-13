-- The Army Painter Speedpaint 2.0 and Warpaints Air, accessed 2026-11-13:
-- https://thearmypainter.com/en-gb/products/speedpaint-speedpaint-complete-set-2-0-wp8061p
-- https://thearmypainter.com/en-gb/products/warpaints-air-warpaints-air-complete-set-aw8003p
-- https://thearmypainter.com/collections/speedpaint/products.json?limit=250
-- https://thearmypainter.com/collections/warpaints-air/products.json?limit=250
-- https://thearmypainter.com/en-gb/pages/downloads
-- https://cdn.shopify.com/s/files/1/0781/9850/5747/files/A3_Speedpaint_2.0_All_Colours_Poster_web.pdf
-- https://cdn.shopify.com/s/files/1/0781/9850/5747/files/A3_All_Warpaints_Air_Poster_web.pdf
--
-- Names and product codes come from individual manufacturer listings. The
-- posters identify 89 Speedpaint colours and 126 Warpaints Air colours.
-- Sets, mediums, cleaners, primers and varnishes are excluded.
-- Swatches are approximate digital samples from the posters, not measured
-- paint colours. Metallic, fluorescent and translucent finishes cannot be
-- represented faithfully by a single hex colour.
-- Reruns only fill NULL codes/colours and never replace existing values or IDs.
-- Conflicting product codes abort the transaction for manual review.
begin;

insert into public.brands (name) values ('The Army Painter')
on conflict ((lower(trim(name)))) do nothing;

insert into public.paint_types (name)
values ('Speedpaint 2.0'), ('Warpaints Air')
on conflict ((lower(trim(name)))) do nothing;

create temporary table army_painter_seed (
  type_name text not null,
  paint_name text not null,
  code text not null unique,
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  primary key (type_name, paint_name)
) on commit drop;

-- Rows are (range, manufacturer product name, product code, approximate colour).
insert into army_painter_seed (type_name, paint_name, code, color) values
  ('Speedpaint 2.0', 'Grim Black', 'WP2001P', '#0A0500'),
  ('Speedpaint 2.0', 'Occultist Cloak', 'WP2027P', '#30303B'),
  ('Speedpaint 2.0', 'Gravelord Grey', 'WP2002P', '#45464B'),
  ('Speedpaint 2.0', 'Holy White', 'WP2003P', '#ECECEC'),
  ('Speedpaint 2.0', 'Blinding Light', 'WP2076P', '#FFFFFF'),
  ('Speedpaint 2.0', 'Cloudburst Blue', 'WP2022P', '#384159'),
  ('Speedpaint 2.0', 'Runic Grey', 'WP2016P', '#537C8E'),
  ('Speedpaint 2.0', 'Ashen Stone', 'WP2025P', '#B6C1C4'),
  ('Speedpaint 2.0', 'Battleship Grey', 'WP2024P', '#BACFD6'),
  ('Speedpaint 2.0', 'Dusk Red', 'WP2054P', '#713D3C'),
  ('Speedpaint 2.0', 'Satchel Brown', 'WP2068P', '#5D372A'),
  ('Speedpaint 2.0', 'Dark Wood', 'WP2005P', '#482B09'),
  ('Speedpaint 2.0', 'Burnished Red', 'WP2083P', '#643B2E'),
  ('Speedpaint 2.0', 'Ruddy Fur', 'WP2065P', '#A2491F'),
  ('Speedpaint 2.0', 'Hardened Leather', 'WP2023P', '#955201'),
  ('Speedpaint 2.0', 'Noble Skin', 'WP2063P', '#4C4639'),
  ('Speedpaint 2.0', 'Goddess Glow', 'WP2038P', '#9A5652'),
  ('Speedpaint 2.0', 'Warrior Skin', 'WP2064P', '#A77350'),
  ('Speedpaint 2.0', 'Murder Scene', 'WP2057P', '#6E2538'),
  ('Speedpaint 2.0', 'Slaughter Red', 'WP2012P', '#9E0E24'),
  ('Speedpaint 2.0', 'Blood Red', 'WP2010P', '#EA290A'),
  ('Speedpaint 2.0', 'Poppy Red', 'WP2056P', '#D1443A'),
  ('Speedpaint 2.0', 'Bright Red', 'WP2058P', '#ED593B'),
  ('Speedpaint 2.0', 'Carmine Dragon', 'WP2055P', '#E72A5B'),
  ('Speedpaint 2.0', 'Maize Yellow', 'WP2059P', '#FFDC00'),
  ('Speedpaint 2.0', 'Ancient Honey', 'WP2060P', '#F3C200'),
  ('Speedpaint 2.0', 'Zealot Yellow', 'WP2013P', '#FFC800'),
  ('Speedpaint 2.0', 'Sand Golem', 'WP2020P', '#CE9800'),
  ('Speedpaint 2.0', 'Nuclear Sunrise', 'WP2061P', '#F16E1D'),
  ('Speedpaint 2.0', 'Fire Giant Orange', 'WP2017P', '#F07B17'),
  ('Speedpaint 2.0', 'Fire Drake', 'WP2062P', '#CB6B40'),
  ('Speedpaint 2.0', 'Aged Hide', 'WP2036P', '#DD6D4E'),
  ('Speedpaint 2.0', 'Peachy Flesh', 'WP2037P', '#F7A86A'),
  ('Speedpaint 2.0', 'Crusader Skin', 'WP2004P', '#F6AA7D'),
  ('Speedpaint 2.0', 'Bony Matter', 'WP2039P', '#B89773'),
  ('Speedpaint 2.0', 'Pallid Bone', 'WP2006P', '#E7D39A'),
  ('Speedpaint 2.0', 'Burnt Moss', 'WP2026P', '#4A5D52'),
  ('Speedpaint 2.0', 'Gunner Camo', 'WP2043P', '#2C533F'),
  ('Speedpaint 2.0', 'Absolution Green', 'WP2007P', '#08471F'),
  ('Speedpaint 2.0', 'Orc Skin', 'WP2009P', '#178222'),
  ('Speedpaint 2.0', 'Mummified Grime', 'WP2078P', '#645E42'),
  ('Speedpaint 2.0', 'Camo Cloak', 'WP2008P', '#567237'),
  ('Speedpaint 2.0', 'Shamrock Green', 'WP2041P', '#59B025'),
  ('Speedpaint 2.0', 'Ghoul Green', 'WP2047P', '#3AAF67'),
  ('Speedpaint 2.0', 'Forest Sprite', 'WP2044P', '#6CA342'),
  ('Speedpaint 2.0', 'Brownish Decay', 'WP2067P', '#655520'),
  ('Speedpaint 2.0', 'Desolate Brown', 'WP2040P', '#777339'),
  ('Speedpaint 2.0', 'Algae Green', 'WP2045P', '#99AF53'),
  ('Speedpaint 2.0', 'Ghillie Dew', 'WP2042P', '#8BBD11'),
  ('Speedpaint 2.0', 'Charming Chartreuse', 'WP2048P', '#D7DD35'),
  ('Speedpaint 2.0', 'Malignant Green', 'WP2011P', '#CAD948'),
  ('Speedpaint 2.0', 'Maggot Skin', 'WP2079P', '#CDD063'),
  ('Speedpaint 2.0', 'Rigor Mortis', 'WP2080P', '#ADB371'),
  ('Speedpaint 2.0', 'Ochre Clay', 'WP2066P', '#B4A402'),
  ('Speedpaint 2.0', 'Tyrian Navy', 'WP2051P', '#243F4D'),
  ('Speedpaint 2.0', 'Beowulf Blue', 'WP2049P', '#003F8A'),
  ('Speedpaint 2.0', 'Highlord Blue', 'WP2015P', '#005588'),
  ('Speedpaint 2.0', 'Plasmatic Bolt', 'WP2019P', '#47B9AF'),
  ('Speedpaint 2.0', 'Thunderbird Blue', 'WP2081P', '#64BC9E'),
  ('Speedpaint 2.0', 'Lizardfolk Cyan', 'WP2082P', '#329DA4'),
  ('Speedpaint 2.0', 'Raging Sea', 'WP2053P', '#0099AA'),
  ('Speedpaint 2.0', 'Caribbean Ocean', 'WP2046P', '#00AEBE'),
  ('Speedpaint 2.0', 'Magic Blue', 'WP2014P', '#007CB4'),
  ('Speedpaint 2.0', 'Tidal Wave', 'WP2052P', '#007BC0'),
  ('Speedpaint 2.0', 'Royal Robes', 'WP2050P', '#3C68AF'),
  ('Speedpaint 2.0', 'Periwinkle Purple', 'WP2035P', '#56549F'),
  ('Speedpaint 2.0', 'Purple Swarm', 'WP2031P', '#643089'),
  ('Speedpaint 2.0', 'Hive Dweller Purple', 'WP2018P', '#523474'),
  ('Speedpaint 2.0', 'Moody Mauve', 'WP2032P', '#A24F82'),
  ('Speedpaint 2.0', 'Moonlake Coral', 'WP2034P', '#AA3671'),
  ('Speedpaint 2.0', 'Purple Alchemy', 'WP2021P', '#AE3C6C'),
  ('Speedpaint 2.0', 'Familiar Pink', 'WP2033P', '#E02989'),
  ('Speedpaint 2.0', 'Howling Sand', 'WP2077P', '#D1D5B7'),
  ('Speedpaint 2.0', 'Pastel Yellow', 'WP2084P', '#FFEB7C'),
  ('Speedpaint 2.0', 'Pastel Salmon', 'WP2085P', '#FBC79A'),
  ('Speedpaint 2.0', 'Princess Pink', 'WP2086P', '#E9A1B7'),
  ('Speedpaint 2.0', 'Pastel Lavender', 'WP2087P', '#D9C3DE'),
  ('Speedpaint 2.0', 'Pastel Indigo', 'WP2088P', '#9FC0E3'),
  ('Speedpaint 2.0', 'Pastel Seafoam', 'WP2089P', '#BADFD2'),
  ('Speedpaint 2.0', 'Glittering Loot', 'WP2070P', '#846600'),
  ('Speedpaint 2.0', 'Hoplite Gold', 'WP2028P', '#947600'),
  ('Speedpaint 2.0', 'Golden Armour', 'WP2069P', '#734600'),
  ('Speedpaint 2.0', 'Hoard Bronze', 'WP2074P', '#88743E'),
  ('Speedpaint 2.0', 'Brazen Copper', 'WP2073P', '#683A31'),
  ('Speedpaint 2.0', 'Talos Bronze', 'WP2029P', '#80442D'),
  ('Speedpaint 2.0', 'Enchanted Steel', 'WP2072P', '#4C5A5E'),
  ('Speedpaint 2.0', 'Broadsword Silver', 'WP2030P', '#5A5B5A'),
  ('Speedpaint 2.0', 'Polished Silver', 'WP2071P', '#8A8C8C'),
  ('Speedpaint 2.0', 'Aztec Gold', 'WP2075P', '#7B8224'),
  ('Warpaints Air', 'Matt Black', 'AW1101P', '#030000'),
  ('Warpaints Air', 'Raven Black', 'AW3101P', '#2D383B'),
  ('Warpaints Air', 'Crow Hue', 'AW4101P', '#4A5654'),
  ('Warpaints Air', 'Regiment Grey', 'AW3118P', '#4A5559'),
  ('Warpaints Air', 'Uniform Grey', 'AW1118P', '#727880'),
  ('Warpaints Air', 'Cadre Grey', 'AW4118P', '#9EAAAD'),
  ('Warpaints Air', 'Shark White', 'AW3102P', '#9FABA7'),
  ('Warpaints Air', 'Yeti White', 'AW4102P', '#C0C4C8'),
  ('Warpaints Air', 'Matt White', 'AW1102P', '#FFFFFF'),
  ('Warpaints Air', 'Iron Wolf', 'AW3119P', '#355668'),
  ('Warpaints Air', 'Wolf Grey', 'AW1119P', '#567CA5'),
  ('Warpaints Air', 'Storm Wolf', 'AW4119P', '#A4BCE1'),
  ('Warpaints Air', 'Thunder Storm', 'AW3415P', '#031C2D'),
  ('Warpaints Air', 'Dark Sky', 'AW1415P', '#283754'),
  ('Warpaints Air', 'Twilight Sky', 'AW4415P', '#005071'),
  ('Warpaints Air', 'Unforgiven Green', 'AW3112P', '#262D2A'),
  ('Warpaints Air', 'Angel Green', 'AW1112P', '#1C3E2B'),
  ('Warpaints Air', 'Exile Green', 'AW4112P', '#4D776B'),
  ('Warpaints Air', 'Majestic Fortress', 'AW3419P', '#007763'),
  ('Warpaints Air', 'Elemental Bolt', 'AW1419P', '#008D77'),
  ('Warpaints Air', 'Psychic Shock', 'AW4419P', '#47B1A0'),
  ('Warpaints Air', 'Ruinous Spell', 'AW3466P', '#005D51'),
  ('Warpaints Air', 'Wizards Orb', 'AW1466P', '#037A6A'),
  ('Warpaints Air', 'Potion Green', 'AW4466P', '#619B82'),
  ('Warpaints Air', 'Hazardous Smog', 'AW3437P', '#2EC5AD'),
  ('Warpaints Air', 'Toxic Mist', 'AW1437P', '#39BAC0'),
  ('Warpaints Air', 'Leviathan Light', 'AW4437P', '#BCDAC7'),
  ('Warpaints Air', 'Ocean Depths', 'AW3141P', '#00556A'),
  ('Warpaints Air', 'Hydra Turquoise', 'AW1141P', '#028F95'),
  ('Warpaints Air', 'Phantasmal Blue', 'AW4141P', '#17BDC5'),
  ('Warpaints Air', 'Militia Green', 'AW3110P', '#2C392A'),
  ('Warpaints Air', 'Army Green', 'AW1110P', '#4E5F38'),
  ('Warpaints Air', 'Drab Green', 'AW4110P', '#616D23'),
  ('Warpaints Air', 'Savage Green', 'AW3111P', '#005D2A'),
  ('Warpaints Air', 'Greenskin', 'AW1111P', '#508A5B'),
  ('Warpaints Air', 'Feral Green', 'AW4111P', '#619665'),
  ('Warpaints Air', 'Gremlin Green', 'AW3109P', '#52672B'),
  ('Warpaints Air', 'Goblin Green', 'AW1109P', '#39922E'),
  ('Warpaints Air', 'Bogey Green', 'AW4109P', '#95B067'),
  ('Warpaints Air', 'Undergrowth Green', 'AW3433P', '#4F8D28'),
  ('Warpaints Air', 'Jungle Green', 'AW1433P', '#8CAB00'),
  ('Warpaints Air', 'Canopy Green', 'AW4433P', '#B1C74B'),
  ('Warpaints Air', 'Pestilent Flesh', 'AW3108P', '#83833F'),
  ('Warpaints Air', 'Necrotic Flesh', 'AW1108P', '#A1AD83'),
  ('Warpaints Air', 'Zombie Flesh', 'AW4108P', '#C1C2A5'),
  ('Warpaints Air', 'Traitor Red', 'AW3142P', '#3F2824'),
  ('Warpaints Air', 'Chaotic Red', 'AW1142P', '#6F1E04'),
  ('Warpaints Air', 'Rebel Red', 'AW4142P', '#95143A'),
  ('Warpaints Air', 'Chimera Red', 'AW3105P', '#6C2233'),
  ('Warpaints Air', 'Dragon Red', 'AW1105P', '#BF1828'),
  ('Warpaints Air', 'Wyrmling Red', 'AW4105P', '#D73F50'),
  ('Warpaints Air', 'Encarmine Red', 'AW3104P', '#920622'),
  ('Warpaints Air', 'Pure Red', 'AW1104P', '#D91312'),
  ('Warpaints Air', 'Archangel Red', 'AW4104P', '#E82916'),
  ('Warpaints Air', 'Molten Orange', 'AW3106P', '#9C391F'),
  ('Warpaints Air', 'Lava Orange', 'AW1106P', '#F07500'),
  ('Warpaints Air', 'Orange Magma', 'AW4106P', '#FFA550'),
  ('Warpaints Air', 'Incursion Orange', 'AW3107P', '#FB8408'),
  ('Warpaints Air', 'Daemonic Yellow', 'AW1107P', '#FCCB00'),
  ('Warpaints Air', 'Imp Yellow', 'AW4107P', '#F5C96E'),
  ('Warpaints Air', 'Witchbane Plum', 'AW3451P', '#7E194E'),
  ('Warpaints Air', 'Warlock Purple', 'AW1451P', '#AF3C6D'),
  ('Warpaints Air', 'Talisman Purple', 'AW4451P', '#E694AC'),
  ('Warpaints Air', 'Fairy Pink', 'AW3447P', '#A04370'),
  ('Warpaints Air', 'Pixie Pink', 'AW1447P', '#DE5E9D'),
  ('Warpaints Air', 'Fey Pink', 'AW4447P', '#DC94B9'),
  ('Warpaints Air', 'Broodmother Purple', 'AW3128P', '#2D2446'),
  ('Warpaints Air', 'Alien Purple', 'AW1128P', '#5E4797'),
  ('Warpaints Air', 'Coven Purple', 'AW4128P', '#956A9B'),
  ('Warpaints Air', 'Magnolia Brown', 'AW3124P', '#33322C'),
  ('Warpaints Air', 'Oak Brown', 'AW1124P', '#3B2C29'),
  ('Warpaints Air', 'Cypress Brown', 'AW4124P', '#664E42'),
  ('Warpaints Air', 'Rawhide Brown', 'AW3123P', '#634129'),
  ('Warpaints Air', 'Leather Brown', 'AW1123P', '#694333'),
  ('Warpaints Air', 'Bullwhack Brown', 'AW4123P', '#A6724C'),
  ('Warpaints Air', 'Charred Bone', 'AW3125P', '#A58762'),
  ('Warpaints Air', 'Skeleton Bone', 'AW1125P', '#C7BA99'),
  ('Warpaints Air', 'Bleached Bone', 'AW4125P', '#EAE2C5'),
  ('Warpaints Air', 'Nomad Flesh', 'AW3126P', '#D17255'),
  ('Warpaints Air', 'Barbarian Flesh', 'AW1126P', '#F49A7E'),
  ('Warpaints Air', 'Wildling Flesh', 'AW4126P', '#FCA688'),
  ('Warpaints Air', 'Brethil Blush', 'AW3421P', '#DA9C5C'),
  ('Warpaints Air', 'Elven Flesh', 'AW1421P', '#FABD93'),
  ('Warpaints Air', 'Feywild Glow', 'AW4421P', '#FAD8A9'),
  ('Warpaints Air', 'Gnome Cheeks', 'AW3434P', '#A88F7F'),
  ('Warpaints Air', 'Kobold Skin', 'AW1434P', '#CFAB88'),
  ('Warpaints Air', 'Hobgoblin Hue', 'AW4434P', '#F8E3CD'),
  ('Warpaints Air', 'Husk Brown', 'AW3122P', '#6D3523'),
  ('Warpaints Air', 'Fur Brown', 'AW1122P', '#7D4943'),
  ('Warpaints Air', 'Viper Brown', 'AW4122P', '#BA6E56'),
  ('Warpaints Air', 'Meteor Rock', 'AW3438P', '#ECBB00'),
  ('Warpaints Air', 'Moon Dust', 'AW1438P', '#F5D959'),
  ('Warpaints Air', 'Cosmic Dust', 'AW4438P', '#F6E87E'),
  ('Warpaints Air', 'Barren Yellow', 'AW3121P', '#9F6A1E'),
  ('Warpaints Air', 'Desert Yellow', 'AW1121P', '#887540'),
  ('Warpaints Air', 'Yellow Dune', 'AW4121P', '#D3A547'),
  ('Warpaints Air', 'Omega Blue', 'AW3115P', '#094276'),
  ('Warpaints Air', 'Ultramarine Blue', 'AW1115P', '#264587'),
  ('Warpaints Air', 'Consul Blue', 'AW4115P', '#5679AC'),
  ('Warpaints Air', 'Sapphire Gem', 'AW3114P', '#004E9A'),
  ('Warpaints Air', 'Crystal Blue', 'AW1114P', '#006CB4'),
  ('Warpaints Air', 'Ionic Blue', 'AW4114P', '#00A1D8'),
  ('Warpaints Air', 'Plate Mail Metal', 'AW1130P', '#828684'),
  ('Warpaints Air', 'Shining Silver', 'AW1129P', '#AEB2B0'),
  ('Warpaints Air', 'Fairy Dust', 'AW1489P', '#CCCFCE'),
  ('Warpaints Air', 'Night Scales', 'AW1490P', '#242D32'),
  ('Warpaints Air', 'Rough Iron', 'AW1468P', '#382C1E'),
  ('Warpaints Air', 'Elven Armor', 'AW1483P', '#144684'),
  ('Warpaints Air', 'Azure Magic', 'AW1486P', '#008882'),
  ('Warpaints Air', 'Glitter Green', 'AW1484P', '#278946'),
  ('Warpaints Air', 'Zephyr Pink', 'AW1485P', '#B25468'),
  ('Warpaints Air', 'Gemstone', 'AW1487P', '#9C1822'),
  ('Warpaints Air', 'Royal Purple', 'AW1488P', '#660455'),
  ('Warpaints Air', 'Evil Chrome', 'AW1491P', '#926044'),
  ('Warpaints Air', 'True Copper', 'AW1467P', '#A16540'),
  ('Warpaints Air', 'Weapon Bronze', 'AW1133P', '#BE6A00'),
  ('Warpaints Air', 'Tainted Gold', 'AW1482P', '#706B41'),
  ('Warpaints Air', 'Greedy Gold', 'AW1132P', '#C4880B'),
  ('Warpaints Air', 'Bright Gold', 'AW1144P', '#CAA004'),
  ('Warpaints Air', 'Gun Metal', 'AW1131P', '#656867'),
  ('Warpaints Air', 'Violet Volt', 'AW1501P', '#AB5E9F'),
  ('Warpaints Air', 'Hot Pink', 'AW1506P', '#EE77AB'),
  ('Warpaints Air', 'Safety Orange', 'AW1505P', '#F8B26B'),
  ('Warpaints Air', 'Neon Yellow', 'AW1504P', '#FFF14B'),
  ('Warpaints Air', 'Blue Flux', 'AW1502P', '#4DC2EE'),
  ('Warpaints Air', 'Gauss Green', 'AW1503P', '#8EC25A');

do $$
begin
  if exists (
    select 1
    from army_painter_seed s
    join public.brands b on lower(trim(b.name)) = 'the army painter'
    join public.paint_types t on lower(trim(t.name)) = lower(trim(s.type_name))
    join public.paints p on p.brand_id = b.id and p.type_id = t.id
      and lower(trim(p.name)) = lower(trim(s.paint_name))
    where p.code is not null and lower(trim(p.code)) <> lower(trim(s.code))
  ) or exists (
    select 1
    from army_painter_seed s
    join public.brands b on lower(trim(b.name)) = 'the army painter'
    join public.paints p on p.brand_id = b.id and lower(trim(p.code)) = lower(trim(s.code))
    join public.paint_types t on t.id = p.type_id
    where lower(trim(t.name)) <> lower(trim(s.type_name))
       or lower(trim(p.name)) <> lower(trim(s.paint_name))
  ) then
    raise exception 'An Army Painter paint conflicts with a seed product code. Review existing records before importing.';
  end if;
end $$;

insert into public.paints (brand_id, type_id, name, code, color)
select b.id, t.id, s.paint_name, s.code, s.color
from army_painter_seed s
join public.brands b on lower(trim(b.name)) = 'the army painter'
join public.paint_types t on lower(trim(t.name)) = lower(trim(s.type_name))
on conflict (brand_id, type_id, (lower(trim(name)))) do update
set code = coalesce(paints.code, excluded.code),
    color = coalesce(paints.color, excluded.color)
where (paints.code is null and excluded.code is not null)
   or (paints.color is null and excluded.color is not null);

commit;
