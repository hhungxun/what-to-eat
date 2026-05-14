-- ============================================================
-- TEST DATA — clears everything and inserts 10 restaurants.
-- Run AFTER: migrate_cuisine_types.sql, add_price_min_max.sql,
--            add_hours_dietary.sql
-- WARNING: deletes all swipe_events, sessions, and restaurants.
-- ============================================================

delete from swipe_events;
delete from sessions;
delete from restaurants;

insert into restaurants (
  name, cuisine_category, description,
  location_label, distance_km, is_on_campus,
  image_url, price_range, price_min, price_max,
  tags, is_active,
  opens_at, closes_at,
  is_halal, is_vegetarian, is_vegan
)
values

  (
    'Nasi Lemak Express',
    'malay',
    'Fragrant coconut rice with sambal, crispy anchovies, and a perfectly boiled egg — the classic campus breakfast that hits every time.',
    'Cafeteria A (Ground Floor)',
    null, true, null,
    1, 4, 9,
    array['halal','nasi lemak','breakfast','rice','budget'],
    true,
    '07:00', '15:00',
    true, false, false
  ),

  (
    'The Noodle Bar',
    'chinese',
    'Handmade pan mee and wonton noodles in rich pork broth — campus''s favourite lunch spot with extra chilli on the side.',
    'Block D6 (Ground Floor)',
    null, true, null,
    1, 5, 12,
    array['noodles','pan mee','pork','wonton','lunch'],
    true,
    '11:00', '21:00',
    false, false, false
  ),

  (
    'Green Bowl',
    'cafe',
    'Fresh salad bowls, grain wraps, and cold-pressed juices for the health-conscious crowd — every dish is plant-based and guilt-free.',
    'Block B1 (Ground Floor)',
    null, true, null,
    2, 9, 18,
    array['vegan','vegetarian','healthy','salad','wraps','juice'],
    true,
    '10:00', '20:00',
    true, true, true
  ),

  (
    'Mamak 24/7',
    'indian',
    'The legendary campus mamak that never closes — roti canai, mee goreng, and teh tarik any hour of the day or night.',
    'Near Residences',
    null, true, null,
    1, 3, 12,
    array['mamak','halal','roti canai','teh tarik','open 24 hours','late night'],
    true,
    null, null,
    true, false, false
  ),

  (
    'Sushi Corner',
    'japanese',
    'Rotating sushi belt with salmon sashimi, unagi rolls, and warm miso soup — affordable Japanese comfort without leaving campus.',
    'Student Hub (Level 2)',
    null, true, null,
    2, 15, 35,
    array['japanese','sushi','sashimi','miso soup','dine-in'],
    true,
    '11:00', '21:00',
    false, false, false
  ),

  (
    'SOI 55 Thai Kitchen',
    'thai',
    'Halal Thai street food done right — bold pad thai, fragrant pineapple fried rice, and fiery tom yum that warms the soul.',
    'Bandar Sunsuria (Sunsuria City)',
    1.30, false, null,
    1, 10, 25,
    array['thai','halal','pad thai','tom yum','fried rice','street food'],
    true,
    '11:00', '22:00',
    true, false, false
  ),

  (
    'Bell Artisan Café',
    'cafe',
    'Specialty flat whites and brunch classics in a bright, airy space — perfect for laptop sessions, slow mornings, or a weekend treat.',
    'Bandar Sunsuria (Bell Avenue)',
    1.20, false, null,
    2, 12, 30,
    array['cafe','coffee','brunch','wifi','western','dessert'],
    true,
    '09:00', '21:00',
    false, true, false
  ),

  (
    'KFC Kota Warisan',
    'fast_food',
    'Drive-thru KFC for reliable McSpicy-style cravings — buckets, Zinger meals, and soft-serve whenever campus food just won''t cut it.',
    'Kota Warisan',
    3.30, false, null,
    1, 8, 20,
    array['fast food','fried chicken','halal','drive thru','burgers'],
    true,
    '10:00', '23:00',
    true, false, false
  ),

  (
    'Hilltop Cuisine',
    'chinese',
    'Open-air Chinese seafood with a jaw-dropping sunset view — butter prawns, steamed fish, and chilli crab with the KLIA skyline behind you.',
    'Kota Warisan (Persiaran Warisan)',
    3.20, false, null,
    3, 40, 100,
    array['chinese','seafood','zi char','sunset view','outdoor','special occasion'],
    true,
    '17:00', '23:00',
    false, false, false
  ),

  (
    'OldTown White Coffee',
    'cafe',
    'The original Malaysian kopitiam — silky white coffee, thick kaya toast, and half-boiled eggs for a breakfast that feels like home.',
    'Kota Warisan',
    3.40, false, null,
    1, 8, 20,
    array['cafe','kopitiam','white coffee','halal','breakfast','toast'],
    true,
    '08:00', '22:00',
    true, true, false
  )

on conflict do nothing;
