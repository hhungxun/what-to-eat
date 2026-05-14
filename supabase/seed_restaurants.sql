-- ============================================================
-- What To Eat — Restaurant Seed Data
-- Researched restaurants at and near Xiamen University Malaysia
-- (XMUM), Bandar Sunsuria, Sepang, Selangor, Malaysia.
--
-- On-campus sources:
--   • XMUM student blog (ycxmum.wordpress.com, 2021)
--   • XMUM canteen tender notices XMUM23T2007 & XMUM24T2007
--   • YummyAdvisor D6 listing
--   • XMUM official Facebook (@xmumalaysia)
--
-- Off-campus sources:
--   • Google Maps / Tripadvisor / YummyAdvisor / Wanderlog
--   • Individual restaurant Facebook / Instagram pages
--   • Food blogs: followmetoeatla, purpledurian.my, says.com
-- ============================================================

insert into restaurants (
  name,
  cuisine_category,
  description,
  location_label,
  distance_km,
  is_on_campus,
  image_url,
  price_range,
  price_min,
  price_max,
  tags,
  is_active
)
values

-- ──────────────────────────────────────────────
-- ON-CAMPUS STALLS & CAFETERIAS
-- ──────────────────────────────────────────────

  -- D6 Ground Floor — economy rice / mixed rice (Da Cheng Xia Shi style)
  (
    'Da Cheng Xia Shi',
    'chinese',
    'Classic economy rice stall where you pick and mix your favourite sides — a full plate of rice with three dishes for under RM5. Great for when you want a quick, filling meal on a budget.',
    'Cafeteria D6 (Ground Floor)',
    null,
    true,
    null,
    1, 3, 6,
    array['economy rice', 'mixed rice', 'budget', 'chinese', 'halal-friendly'],
    true
  ),

  -- D6 Second Floor — Arab/Middle Eastern (Kabaabish)
  (
    'Restaurant Kabaabish',
    'other',
    'Popular Arab-style stall on the second floor of D6 offering rice and side dishes at wallet-friendly prices — mix and match for a filling meal from as little as RM5.',
    'Cafeteria D6 (2nd Floor, Unit 206)',
    null,
    true,
    null,
    1, 4, 8,
    array['halal', 'arabic', 'middle eastern', 'rice', 'budget'],
    true
  ),

  -- LY3 Canteen — noodles (Kami Cemerlang)
  (
    'Kami Cemerlang',
    'chinese',
    'The go-to noodle stall in the LY3 canteen, famous for freshly made pan mee — order the kosong (plain) for just RM3 or load it up with toppings for a hearty bowl.',
    'Canteen LY3',
    null,
    true,
    null,
    1, 3, 8,
    array['noodles', 'pan mee', 'budget', 'chinese'],
    true
  ),

  -- D6 — Chinese restaurant / Asian cuisine (D6 Restaurant)
  (
    'D6 Restaurant',
    'chinese',
    'Sit-down Chinese restaurant on the XMUM campus serving rice, noodle, and stir-fry dishes for students and staff — open early morning until evening.',
    'Block D6',
    null,
    true,
    null,
    1, 5, 25,
    array['chinese', 'stir fry', 'rice', 'noodles', 'dine-in'],
    true
  ),

  -- B1 Ground Floor — Muslim-friendly / Malay cuisine (tender XMUM24T2007)
  (
    'Selera Nusantara',
    'malay',
    'Halal-certified cafeteria stall in Block B1 serving authentic Malay staples — nasi lemak, lauk-pauk, and freshly prepared rice dishes to fuel your study sessions.',
    'Cafeteria B1 (Ground Floor, Unit G06)',
    null,
    true,
    null,
    1, 4, 10,
    array['halal', 'malay', 'nasi lemak', 'rice', 'budget'],
    true
  ),

  -- Lakeside Café / Musical Island
  (
    'Lakeside Café',
    'cafe',
    'Charming open-air café right on the XMUM lake, beloved for its crispy waffles loaded with kaya, chocolate, or peanut butter. Also serves taro balls, teh tarik, and light snacks — perfect for a sunset chill.',
    'Musical Island (Lakeside)',
    null,
    true,
    null,
    1, 3, 12,
    array['cafe', 'waffles', 'taro ball', 'dessert', 'drinks', 'lake view', 'open late'],
    true
  ),

  -- General Malay / Indian stall — pasar malam / Hammeds area
  (
    'Hammeds Mamak',
    'indian',
    'Beloved on-campus mamak serving roti canai, nasi goreng, teh tarik, and mee goreng around the clock. The Wednesday and Saturday pasar malam out front is a campus tradition.',
    'Near Residences (Hammeds)',
    null,
    true,
    null,
    1, 3, 9,
    array['mamak', 'halal', 'roti canai', 'teh tarik', 'mee goreng', 'open late', 'budget'],
    true
  ),

-- ──────────────────────────────────────────────
-- OFF-CAMPUS — BANDAR SUNSURIA (~1–2 km)
-- ──────────────────────────────────────────────

  -- Bell Artisan Café, Bell Avenue, Bandar Sunsuria
  (
    'Bell Artisan Café',
    'cafe',
    'Stylish all-day café at Bell Avenue serving specialty coffee, pastas, laksa, and indulgent desserts in a bright, Instagrammable space — great for laptop sessions or weekend brunch.',
    'Bandar Sunsuria (Bell Avenue)',
    1.20,
    false,
    null,
    2, 12, 30,
    array['cafe', 'coffee', 'brunch', 'western', 'pasta', 'dessert', 'wifi'],
    true
  ),

  -- SOI 55 Thai Kitchen, Sunsuria City
  (
    'SOI 55 Thai Kitchen',
    'thai',
    'Halal Thai street-food favourite tucked into Sunsuria City, dishing out bold pad thai, pineapple fried rice, and fiery tom yum with generous portions and great value.',
    'Bandar Sunsuria (Sunsuria City)',
    1.30,
    false,
    null,
    1, 10, 25,
    array['thai', 'halal', 'pad thai', 'tom yum', 'fried rice', 'street food'],
    true
  ),

  -- Lakeside Thai Pot, Giverny Walk, Bandar Sunsuria
  (
    'Lakeside Thai Pot',
    'thai',
    'Unique Thai charcoal steamboat and grill spot on the lakeside of Sunsuria City — fairy-lit tent atmosphere, halal-certified buffet from RM48 per person, and stunning evening views.',
    'Bandar Sunsuria (Giverny Walk)',
    1.40,
    false,
    null,
    2, 48, 70,
    array['thai', 'steamboat', 'bbq', 'grill', 'halal', 'buffet', 'lake view', 'romantic'],
    true
  ),

-- ──────────────────────────────────────────────
-- OFF-CAMPUS — KOTA WARISAN (~2–4 km)
-- ──────────────────────────────────────────────

  -- Salam Noodles, Kota Warisan
  (
    'Salam Noodles',
    'chinese',
    'Halal Xinjiang-Muslim noodle house serving thick handmade noodles in rich broth, tender beef rice, and irresistible charcoal-grilled chicken skewers — all with free-flow drinks included.',
    'Kota Warisan',
    2.80,
    false,
    null,
    1, 8, 20,
    array['halal', 'chinese muslim', 'xinjiang', 'noodles', 'beef', 'skewers', 'free flow drinks'],
    true
  ),

  -- Nasi Lemak Royale, Kota Warisan
  (
    'Nasi Lemak Royale',
    'malay',
    'Indian-Muslim spot celebrated for fragrant nasi lemak, yellow rice, and generous lauk including satay and crispy fried chicken — fast service and super affordable.',
    'Kota Warisan',
    2.80,
    false,
    null,
    1, 4, 15,
    array['halal', 'nasi lemak', 'malay', 'indian muslim', 'budget', 'rice'],
    true
  ),

  -- Nasi Kandar Express, Kota Warisan
  (
    'Nasi Kandar Express',
    'indian',
    'No-frills nasi kandar counter near the Kota Warisan mosque with crowd-pleasing curry gravies, chicken, and biryani-style rice — set meals from RM11.50 keep it easy on the wallet.',
    'Kota Warisan (Arena Warisan Puteri)',
    3.00,
    false,
    null,
    1, 6, 15,
    array['halal', 'nasi kandar', 'indian', 'mamak', 'curry', 'budget'],
    true
  ),

  -- Mabrouk Nasi Kandar, Kota Warisan
  (
    'Mabrouk Nasi Kandar',
    'indian',
    'Open 24 hours, this beloved mamak near Kota Warisan is the late-night saviour with flowing kuah banjir curry, naan with garlic sauce, and all the comfort of a proper nasi kandar spread.',
    'Kota Warisan (Arena Warisan Puteri)',
    3.00,
    false,
    null,
    1, 6, 15,
    array['halal', 'mamak', 'nasi kandar', 'open 24 hours', 'indian', 'late night'],
    true
  ),

  -- Restoran DarSA, Kota Warisan
  (
    'Restoran DarSA',
    'other',
    'Fragrant Arabian-Malaysian kitchen specialising in slow-cooked nasi mendy, succulent lamb, and freshly rolled shawarma — halal comfort food with Middle Eastern warmth.',
    'Kota Warisan (Arena Warisan Puteri)',
    3.00,
    false,
    null,
    1, 9, 35,
    array['halal', 'arabic', 'middle eastern', 'nasi mendy', 'shawarma', 'lamb'],
    true
  ),

  -- El Boney Quattro Formaggi, Kota Warisan
  (
    'El Boney Quattro Formaggi',
    'italian',
    'Surprisingly authentic Italian restaurant in the heart of Kota Warisan — think wood-fired lasagna, cheesy quattro-formaggi pasta, and meltique wagyu, all served with dramatic tableside flambé.',
    'Kota Warisan (Jalan Warisan Sentral 1)',
    3.00,
    false,
    null,
    2, 20, 60,
    array['italian', 'pasta', 'pizza', 'western', 'date night', 'wagyu'],
    true
  ),

  -- PappaGrill, Kota Warisan
  (
    'PappaGrill',
    'western',
    'Popular steakhouse and grill in Kota Warisan serving sizeable steaks, nachos, fish and chips, and even nasi lemak — the Maharaja Platter for two at RM69 is legendary among students.',
    'Kota Warisan (Jalan Warisan Sentral 2)',
    3.10,
    false,
    null,
    2, 15, 70,
    array['western', 'steak', 'grill', 'halal-friendly', 'sharing platters'],
    true
  ),

  -- Hilltop Cuisine, Kota Warisan
  (
    'Hilltop Cuisine',
    'chinese',
    'Breezy open-air Chinese seafood restaurant perched on a hill in Kota Warisan with jaw-dropping sunset views — fresh butter prawns, steamed fish, and chilli crab with the KLIA skyline as backdrop.',
    'Kota Warisan (Persiaran Warisan)',
    3.20,
    false,
    null,
    3, 40, 100,
    array['chinese', 'seafood', 'zi char', 'sunset view', 'outdoor dining', 'special occasion'],
    true
  ),

  -- Hulu Café, Kota Warisan
  (
    'Hulu Café',
    'cafe',
    'Rustic-chic café in Kota Warisan with standout specialty coffee, egg benedict on sourdough, and handcrafted tiramisu — a cosy retreat for study dates or slow weekend mornings.',
    'Kota Warisan',
    3.20,
    false,
    null,
    2, 10, 30,
    array['cafe', 'coffee', 'brunch', 'specialty coffee', 'tiramisu', 'wifi'],
    true
  ),

  -- Secret Recipe, KIP Mall Kota Warisan
  (
    'Secret Recipe',
    'cafe',
    'Malaysia''s favourite cake-and-café chain with a branch at KIP Mall — perfect for a slice of New York cheesecake, a bowl of pasta, or a casual Western meal after a shopping run.',
    'KIP Mall Kota Warisan (Lot G03)',
    3.30,
    false,
    null,
    2, 12, 35,
    array['cafe', 'cakes', 'western', 'pasta', 'dessert', 'air-conditioned', 'mall'],
    true
  ),

  -- McDonald's, Kota Warisan
  (
    'McDonald''s Kota Warisan',
    'fast_food',
    'Drive-thru McDonald''s right in Kota Warisan — reliable 24/7 fix for McSpicy burgers, McFlurries, and breakfast McMuffins whenever campus food just won''t cut it.',
    'Kota Warisan',
    3.30,
    false,
    null,
    1, 6, 20,
    array['fast food', 'burgers', 'drive thru', 'open 24 hours', 'breakfast'],
    true
  ),

  -- KFC, Kota Warisan Drive-Thru
  (
    'KFC Kota Warisan',
    'fast_food',
    'Drive-thru KFC for when you need a bucket of Original Recipe or a Zinger Burger fix — quick, familiar, and easy on the pocket for a casual student meal.',
    'Kota Warisan',
    3.30,
    false,
    null,
    1, 8, 20,
    array['fast food', 'fried chicken', 'halal', 'drive thru', 'burgers'],
    true
  ),

  -- OLDTOWN White Coffee, Kota Warisan
  (
    'OldTown White Coffee',
    'cafe',
    'Cosy Malaysian kopitiam chain famous for its creamy white coffee and all-day breakfast — toast with kaya butter, half-boiled eggs, and a steaming mug of original white coffee.',
    'Kota Warisan',
    3.40,
    false,
    null,
    1, 8, 20,
    array['cafe', 'kopitiam', 'white coffee', 'breakfast', 'toast', 'halal'],
    true
  ),

-- ──────────────────────────────────────────────
-- OFF-CAMPUS — SALAK TINGGI / SEPANG (~4–5 km)
-- ──────────────────────────────────────────────

  -- Restoran Roi Roi, Salak Tinggi
  (
    'Restoran Roi Roi',
    'chinese',
    'No-frills zi char favourite near the Sepang circuit, celebrated for its garlic pork ribs, fresh seafood dishes, and hearty vegetable stir-fries at very reasonable prices.',
    'Salak Tinggi',
    4.50,
    false,
    null,
    2, 15, 40,
    array['chinese', 'zi char', 'seafood', 'pork', 'lunch', 'dinner'],
    true
  ),

  -- Makan and Minum at Tune Hotel KLIA2
  (
    'Makan and Minum',
    'western',
    'All-day diner and bar at Tune Hotel KLIA2 — serves Asian favourites and Western comfort food 24 hours a day, from early breakfast at 4:30 am to a late-night curry or pizza.',
    'Tune Hotel KLIA-KLIA2, Sepang',
    5.00,
    false,
    null,
    2, 15, 35,
    array['western', 'asian fusion', 'breakfast', 'open 24 hours', 'bar', 'hotel dining'],
    true
  ),

  -- Nasi Kandar Ori Utara, Kota Warisan / Salak Tinggi
  (
    'Nasi Kandar Ori Utara',
    'indian',
    'Authentic northern-style nasi kandar transplanted to Sepang — stacked with fragrant basmati, rich mutton curry, and crispy papadum, straight from the hawker tradition of Penang.',
    'Bandar Baru Salak Tinggi',
    4.80,
    false,
    null,
    1, 7, 15,
    array['halal', 'nasi kandar', 'indian', 'mamak', 'curry', 'northern style', 'budget'],
    true
  )

on conflict do nothing;
