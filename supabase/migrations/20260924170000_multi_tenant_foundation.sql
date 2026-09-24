-- Multi-tenant foundation for Weddfin.
-- Existing data is assigned to the first vendor during migration.

CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, auth_user_id)
);

INSERT INTO public.vendors (name, slug)
VALUES ('VENA PICTURES', 'vena-pictures')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.vendor_memberships (vendor_id, auth_user_id, role)
SELECT v.id, a.id, COALESCE(u.role, 'member')
FROM public.vendors v
JOIN auth.users a ON a.email IN ('admin@vena.com', 'kasir@atter.com', 'member@atter.com')
LEFT JOIN public.users u ON lower(u.email) = lower(a.email)
WHERE v.slug = 'vena-pictures'
ON CONFLICT (vendor_id, auth_user_id) DO UPDATE
SET role = EXCLUDED.role;

DO $$
DECLARE
  table_name text;
  tenant_tables constant text[] := ARRAY[
    'users', 'profiles', 'clients', 'projects', 'team_members',
    'leads', 'calendar_events', 'packages', 'promo_codes', 'notifications',
    'add_ons', 'bookings', 'cards', 'client_feedback', 'contracts',
    'galleries', 'pockets', 'project_add_ons', 'project_team_assignments',
    'team_payment_records', 'team_project_payments', 'transactions',
    'vendor_portfolios', 'vendor_profiles', 'wedding_day_checklists'
  ];
BEGIN
  FOREACH table_name IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS vendor_id uuid', table_name);
    EXECUTE format(
      'UPDATE public.%I SET vendor_id = v.id FROM public.vendors v WHERE public.%I.vendor_id IS NULL AND v.slug = ''vena-pictures''',
      table_name, table_name
    );
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN vendor_id SET NOT NULL', table_name);
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = table_name || '_vendor_id_fkey'
        AND conrelid = ('public.' || table_name)::regclass
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE',
        table_name, table_name || '_vendor_id_fkey'
      );
    END IF;
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(vendor_id)', 'idx_' || table_name || '_vendor_id', table_name);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.current_vendor_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vendor_id
  FROM public.vendor_memberships
  WHERE auth_user_id = auth.uid()
  ORDER BY created_at
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_vendor_member(target_vendor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vendor_memberships
    WHERE vendor_id = target_vendor_id
      AND auth_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.set_current_vendor_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vendor_id IS NULL THEN
    NEW.vendor_id := public.current_vendor_id();
  END IF;
  IF NEW.vendor_id IS NULL THEN
    RAISE EXCEPTION 'No active vendor membership for authenticated user';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name text;
  tenant_tables constant text[] := ARRAY[
    'users', 'profiles', 'clients', 'projects', 'team_members',
    'leads', 'calendar_events', 'packages', 'promo_codes', 'notifications',
    'add_ons', 'bookings', 'cards', 'client_feedback', 'contracts',
    'galleries', 'pockets', 'project_add_ons', 'project_team_assignments',
    'team_payment_records', 'team_project_payments', 'transactions',
    'vendor_portfolios', 'vendor_profiles', 'wedding_day_checklists'
  ];
BEGIN
  FOREACH table_name IN ARRAY tenant_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_current_vendor_id ON public.%I', table_name);
    EXECUTE format('CREATE TRIGGER set_current_vendor_id BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_current_vendor_id()', table_name);
  END LOOP;
END $$;

DO $$
DECLARE
  policy_record record;
  table_name text;
  tenant_tables constant text[] := ARRAY[
    'users', 'profiles', 'clients', 'projects', 'team_members',
    'leads', 'calendar_events', 'packages', 'promo_codes', 'notifications',
    'add_ons', 'bookings', 'cards', 'client_feedback', 'contracts',
    'galleries', 'pockets', 'project_add_ons', 'project_team_assignments',
    'team_payment_records', 'team_project_payments', 'transactions',
    'vendor_portfolios', 'vendor_profiles', 'wedding_day_checklists'
  ];
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY(tenant_tables)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  END LOOP;

  FOREACH table_name IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_vendor_member(vendor_id)) WITH CHECK (public.is_vendor_member(vendor_id))',
      'tenant_isolation_' || table_name, table_name
    );
  END LOOP;
END $$;

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendors_member_select ON public.vendors;
CREATE POLICY vendors_member_select ON public.vendors
FOR SELECT TO authenticated
USING (public.is_vendor_member(id));

DROP POLICY IF EXISTS memberships_self_select ON public.vendor_memberships;
CREATE POLICY memberships_self_select ON public.vendor_memberships
FOR SELECT TO authenticated
USING (auth_user_id = auth.uid());

GRANT EXECUTE ON FUNCTION public.current_vendor_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_vendor_member(uuid) TO authenticated;
