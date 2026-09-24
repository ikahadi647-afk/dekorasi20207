import supabase from '../lib/supabaseClient';

export async function getCurrentAuthUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getCurrentVendorId(): Promise<string | null> {
  const userId = await getCurrentAuthUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('vendor_memberships')
    .select('vendor_id')
    .eq('auth_user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.vendor_id ?? null;
}
