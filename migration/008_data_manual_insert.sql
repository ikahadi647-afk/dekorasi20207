-- ============================================
-- MANUAL DATA INSERT (FIXED VERSION)
-- ============================================
-- Insert critical data only for testing
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable triggers temporarily
SET session_replication_role = replica;

-- ============================================
-- Insert packages (10 rows)
-- ============================================
INSERT INTO public.packages (id, name, price, category, region, physical_items, digital_items, processing_time, default_printing_cost, default_transport_cost, photographers, videographers, cover_image, duration_options)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'Basic Package', 5000000, 'Pernikahan', 'Banten', '["Album 20x30"]'::jsonb, '["Softcopy HD"]'::jsonb, '7 hari', 500000, 200000, '1 Photographer', '0', '', '[{"duration": "4 jam", "price": 5000000}]'::jsonb),
  (gen_random_uuid(), 'Standard Package', 10000000, 'Pernikahan', 'Banten', '["Album 30x40"]'::jsonb, '["Softcopy Full HD", "Video Highlight"]'::jsonb, '14 hari', 750000, 300000, '2 Photographers', '1 Videographer', '', '[{"duration": "6 jam", "price": 10000000}]'::jsonb),
  (gen_random_uuid(), 'Premium Package', 15000000, 'Pernikahan', 'Banten', '["Album Premium 40x60"]'::jsonb, '["4K Video", "Drone Footage"]'::jsonb, '21 hari', 1000000, 500000, '2 Photographers', '2 Videographers', '', '[{"duration": "Full Day", "price": 15000000}]'::jsonb),
  (gen_random_uuid(), 'Platinum Package', 20000000, 'Pernikahan', 'Banten', '["2 Album Premium"]'::jsonb, '["Cinematic 4K", "Drone", "Same Day Edit"]'::jsonb, '30 hari', 1500000, 750000, '3 Photographers', '2 Videographers', '', '[{"duration": "Full Day + Night", "price": 20000000}]'::jsonb),
  (gen_random_uuid(), 'Engagement Package', 3000000, 'Lamaran / Engagement', 'Banten', '["Mini Album"]'::jsonb, '["Softcopy HD"]'::jsonb, '7 hari', 300000, 150000, '1 Photographer', '0', '', '[{"duration": "3 jam", "price": 3000000}]'::jsonb),
  (gen_random_uuid(), 'Prewedding Package', 8000000, 'Pernikahan', 'Banten', '["Album 30x40"]'::jsonb, '["Softcopy Full HD"]'::jsonb, '14 hari', 600000, 400000, '2 Photographers', '1 Videographer', '', '[{"duration": "1 hari outdoor", "price": 8000000}]'::jsonb),
  (gen_random_uuid(), 'Corporate Package', 7000000, 'Corporate / Event', 'Banten', '[]'::jsonb, '["Softcopy Full HD", "Same Day Edit"]'::jsonb, '3 hari', 0, 300000, '2 Photographers', '1 Videographer', '', '[{"duration": "Half Day", "price": 7000000}]'::jsonb),
  (gen_random_uuid(), 'Birthday Package', 4000000, 'Ulang Tahun', 'Banten', '["Mini Album"]'::jsonb, '["Softcopy HD", "Video Clip"]'::jsonb, '7 hari', 400000, 200000, '1 Photographer', '1 Videographer', '', '[{"duration": "4 jam", "price": 4000000}]'::jsonb),
  (gen_random_uuid(), 'Graduation Package', 2000000, 'Wisuda', 'Banten', '[]'::jsonb, '["Softcopy HD"]'::jsonb, '3 hari', 0, 100000, '1 Photographer', '0', '', '[{"duration": "2 jam", "price": 2000000}]'::jsonb),
  (gen_random_uuid(), 'Custom Package', 0, 'Lainnya', 'Banten', '[]'::jsonb, '[]'::jsonb, 'Custom', 0, 0, 'Custom', 'Custom', '', '[]'::jsonb)
) AS t(id, name, price, category, region, physical_items, digital_items, processing_time, default_printing_cost, default_transport_cost, photographers, videographers, cover_image, duration_options)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Insert add_ons (5 rows)
-- ============================================
INSERT INTO public.add_ons (id, name, price, region)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'Drone Photography', 2000000, 'Banten'),
  (gen_random_uuid(), 'Same Day Edit', 3000000, 'Banten'),
  (gen_random_uuid(), 'Premium Album', 1500000, 'Banten'),
  (gen_random_uuid(), 'Extra Photographer', 2500000, 'Banten'),
  (gen_random_uuid(), 'Cinematic Video', 5000000, 'Banten')
) AS t(id, name, price, region)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Insert sample clients (3 rows)
-- ============================================
INSERT INTO public.clients (id, name, email, phone, whatsapp, since, instagram, status, client_type, last_contact, portal_access_id, address, package_price)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'Budi & Ani', 'budi.ani@example.com', '081234567890', '081234567890', NOW(), '@budianicouple', 'active', 'Wedding', NOW(), gen_random_uuid(), 'Jakarta Selatan', 15000000),
  (gen_random_uuid(), 'Candra & Desi', 'candra.desi@example.com', '081234567891', '081234567891', NOW(), '@candradesilovest story', 'active', 'Wedding', NOW(), gen_random_uuid(), 'Bandung', 10000000),
  (gen_random_uuid(), 'Eko & Fitri', 'eko.fitri@example.com', '081234567892', '081234567892', NOW(), '@ekofitri', 'lead', 'Wedding', NOW(), gen_random_uuid(), 'Surabaya', 20000000)
) AS t(id, name, email, phone, whatsapp, since, instagram, status, client_type, last_contact, portal_access_id, address, package_price)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Create profile for new auth user
-- ============================================
INSERT INTO public.profiles (
  id,
  admin_user_id,
  full_name,
  email,
  phone,
  company_name,
  address,
  bank_account,
  authorized_signer,
  brand_color
)
VALUES (
  gen_random_uuid(),
  '9eb44a47-7baa-45ed-a3e5-2cc4a26e95fd',
  'Admin VENA',
  'admin@vena.com',
  '085693994277',
  'VENA PICTURES',
  'Serang, Banten',
  'BANK JAGO - 104335728445 - MADANIAH',
  'MADANIAH',
  '#3b82f6'
)
ON CONFLICT (id) DO NOTHING;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================
-- SUMMARY
-- ============================================
-- Expected results:
-- - 10 packages
-- - 5 add-ons
-- - 3 clients
-- - 1 profile
-- Total: 19 rows
-- ============================================
