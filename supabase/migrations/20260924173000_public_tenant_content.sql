-- Public content remains readable without authentication.
-- Private tenant tables keep the tenant isolation policies from the foundation migration.

DROP POLICY IF EXISTS public_active_vendors_select ON public.vendors;
CREATE POLICY public_active_vendors_select ON public.vendors
FOR SELECT TO anon
USING (status = 'active');

DROP POLICY IF EXISTS public_vendor_profiles_select ON public.vendor_profiles;
CREATE POLICY public_vendor_profiles_select ON public.vendor_profiles
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS public_galleries_select ON public.galleries;
CREATE POLICY public_galleries_select ON public.galleries
FOR SELECT TO anon
USING (is_public = true);

DROP POLICY IF EXISTS public_vendor_portfolios_select ON public.vendor_portfolios;
CREATE POLICY public_vendor_portfolios_select ON public.vendor_portfolios
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS public_packages_select ON public.packages;
CREATE POLICY public_packages_select ON public.packages
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS public_add_ons_select ON public.add_ons;
CREATE POLICY public_add_ons_select ON public.add_ons
FOR SELECT TO anon
USING (true);

DROP POLICY IF EXISTS public_promo_codes_select ON public.promo_codes;
CREATE POLICY public_promo_codes_select ON public.promo_codes
FOR SELECT TO anon
USING (is_active = true);
