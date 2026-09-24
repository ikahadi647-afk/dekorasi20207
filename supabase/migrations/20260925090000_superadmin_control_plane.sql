-- Superadmin control plane for vendors, users, and subscriptions.

CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
  vendor_id uuid PRIMARY KEY REFERENCES public.vendors(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  max_users integer NOT NULL DEFAULT 5 CHECK (max_users > 0),
  renewal_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.vendor_subscriptions (vendor_id)
SELECT id FROM public.vendors
ON CONFLICT (vendor_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'Superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_vendor_member(target_vendor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_superadmin()
    OR EXISTS (
      SELECT 1
      FROM public.vendor_memberships
      WHERE vendor_id = target_vendor_id
        AND auth_user_id = auth.uid()
    );
$$;

ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_subscription_select ON public.vendor_subscriptions;
CREATE POLICY tenant_subscription_select ON public.vendor_subscriptions
FOR SELECT TO authenticated
USING (public.is_vendor_member(vendor_id));

DROP POLICY IF EXISTS superadmin_subscription_all ON public.vendor_subscriptions;
CREATE POLICY superadmin_subscription_all ON public.vendor_subscriptions
FOR ALL TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS superadmin_vendors_all ON public.vendors;
CREATE POLICY superadmin_vendors_all ON public.vendors
FOR ALL TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS superadmin_memberships_all ON public.vendor_memberships;
CREATE POLICY superadmin_memberships_all ON public.vendor_memberships
FOR ALL TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS superadmin_users_all ON public.users;
CREATE POLICY superadmin_users_all ON public.users
FOR ALL TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_vendor_member(uuid) TO authenticated;
