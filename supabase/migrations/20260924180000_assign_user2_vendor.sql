-- Assign the second application account to its own vendor.
-- user2 is kasir@atter.com in the current account list.

DO $$
DECLARE
  target_vendor_id uuid;
  target_user_id uuid;
BEGIN
  SELECT id INTO target_vendor_id
  FROM public.vendors
  WHERE slug = 'vendor-2';

  IF target_vendor_id IS NULL THEN
    INSERT INTO public.vendors (name, slug)
    VALUES ('Vendor 2', 'vendor-2')
    RETURNING id INTO target_vendor_id;
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = 'kasir@atter.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user kasir@atter.com not found';
  END IF;

  DELETE FROM public.vendor_memberships
  WHERE auth_user_id = target_user_id
    AND vendor_id <> target_vendor_id;

  INSERT INTO public.vendor_memberships (vendor_id, auth_user_id, role)
  VALUES (target_vendor_id, target_user_id, 'admin')
  ON CONFLICT (vendor_id, auth_user_id) DO UPDATE
  SET role = EXCLUDED.role;

  UPDATE public.users
  SET vendor_id = target_vendor_id
  WHERE lower(email) = 'kasir@atter.com';

  IF NOT EXISTS (
    SELECT 1 FROM public.vendor_profiles WHERE vendor_id = target_vendor_id
  ) THEN
    INSERT INTO public.vendor_profiles (
      vendor_id,
      hero_title,
      hero_subtitle,
      hero_image_url,
      whatsapp_number,
      info_images,
      created_at,
      updated_at,
      hero_images,
      faqs,
      partners,
      videos
    ) VALUES (
      target_vendor_id,
      'Vendor 2',
      'Profil vendor baru',
      '',
      '',
      '[]'::jsonb,
      now(),
      now(),
      '[]'::jsonb,
      '[]'::jsonb,
      '[]'::jsonb,
      '[]'::jsonb
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE vendor_id = target_vendor_id
  ) THEN
    INSERT INTO public.profiles (
      vendor_id,
      admin_user_id,
      full_name,
      email,
      phone,
      company_name,
      address,
      bank_account,
      authorized_signer,
      brand_color
    ) VALUES (
      target_vendor_id,
      target_user_id,
      'Vendor 2 Admin',
      'kasir@atter.com',
      '',
      'Vendor 2',
      '',
      '',
      '',
      '#111827'
    );
  END IF;
END $$;
