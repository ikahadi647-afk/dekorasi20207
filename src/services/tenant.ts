import supabase from '../lib/supabaseClient';

export async function getCurrentVendorId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('vendor_memberships')
    .select('vendor_id')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.vendor_id ?? null;
}
