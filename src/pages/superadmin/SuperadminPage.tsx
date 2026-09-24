import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CreditCard, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

type Vendor = { id: string; name: string; slug: string; status: 'active' | 'suspended'; created_at: string };
type ManagedUser = { id: string; email: string; full_name: string; company_name: string; role: string; vendor_id: string };
type Subscription = { vendor_id: string; plan: string; status: string; max_users: number; renewal_date: string | null };

const planOptions = ['starter', 'growth', 'pro', 'enterprise'];
const statusOptions = ['trial', 'active', 'past_due', 'suspended', 'cancelled'];

export default function SuperadminPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const subscriptionByVendor = useMemo(
    () => new Map(subscriptions.map(subscription => [subscription.vendor_id, subscription])),
    [subscriptions],
  );

  const loadControlPlane = async () => {
    setLoading(true);
    const [vendorResult, userResult, subscriptionResult] = await Promise.all([
      supabase.from('vendors').select('id,name,slug,status,created_at').order('created_at', { ascending: false }),
      supabase.from('users').select('id,email,full_name,company_name,role,vendor_id').order('email'),
      supabase.from('vendor_subscriptions').select('vendor_id,plan,status,max_users,renewal_date'),
    ]);
    const error = vendorResult.error || userResult.error || subscriptionResult.error;
    if (error) setMessage(error.message);
    setVendors(vendorResult.data || []);
    setUsers(userResult.data || []);
    setSubscriptions(subscriptionResult.data || []);
    setLoading(false);
  };

  useEffect(() => { void loadControlPlane(); }, []);

  const createVendor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    setMessage('');
    const vendorResult = await supabase
      .from('vendors')
      .insert({ name: name.trim(), slug: slug.trim().toLowerCase(), status: 'active' })
      .select('id')
      .single();
    if (!vendorResult.error && vendorResult.data) {
      await supabase.from('vendor_subscriptions').insert({ vendor_id: vendorResult.data.id });
      setName('');
      setSlug('');
      setMessage('Vendor berhasil dibuat.');
      await loadControlPlane();
    } else {
      setMessage(vendorResult.error?.message || 'Vendor gagal dibuat.');
    }
    setSaving(false);
  };

  const updateVendor = async (id: string, status: Vendor['status']) => {
    const { error } = await supabase.from('vendors').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) setMessage(error.message);
    else setVendors(current => current.map(vendor => vendor.id === id ? { ...vendor, status } : vendor));
  };

  const updateSubscription = async (vendorId: string, patch: Partial<Subscription>) => {
    const { error } = await supabase.from('vendor_subscriptions').update({ ...patch, updated_at: new Date().toISOString() }).eq('vendor_id', vendorId);
    if (error) setMessage(error.message);
    else setSubscriptions(current => current.map(subscription => subscription.vendor_id === vendorId ? { ...subscription, ...patch } : subscription));
  };

  const updateUserRole = async (id: string, role: string) => {
    const { error } = await supabase.from('users').update({ role, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) setMessage(error.message);
    else setUsers(current => current.map(user => user.id === id ? { ...user, role } : user));
  };

  const updateUserVendor = async (user: ManagedUser, vendorId: string) => {
    const { error: userError } = await supabase.from('users').update({ vendor_id: vendorId, updated_at: new Date().toISOString() }).eq('id', user.id);
    const { error: membershipError } = await supabase.from('vendor_memberships').update({ vendor_id: vendorId }).eq('auth_user_id', user.id);
    const error = userError || membershipError;
    if (error) setMessage(error.message);
    else setUsers(current => current.map(item => item.id === user.id ? { ...item, vendor_id: vendorId } : item));
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Memuat control plane...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Control Plane</p>
          <h1 className="text-2xl font-bold text-slate-900">Superadmin</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola tenant, user, membership, dan subscription dari satu tempat.</p>
        </div>
        <button onClick={() => void loadControlPlane()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {message && <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Vendor aktif', vendors.filter(vendor => vendor.status === 'active').length, Building2],
          ['Total user', users.length, Users],
          ['Subscription trial', subscriptions.filter(subscription => subscription.status === 'trial').length, CreditCard],
          ['Tenant terisolasi', vendors.length, ShieldCheck],
        ].map(([label, value, Icon]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5"><Icon className="h-5 w-5 text-indigo-500" /><p className="mt-4 text-2xl font-bold text-slate-900">{value as number}</p><p className="text-sm text-slate-500">{label}</p></div>)}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4 mb-4"><div><h2 className="font-bold text-slate-900">Tambah vendor</h2><p className="text-xs text-slate-500">Buat tenant kosong untuk onboarding user baru.</p></div></div>
        <form onSubmit={createVendor} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input value={name} onChange={event => setName(event.target.value)} placeholder="Nama vendor" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input value={slug} onChange={event => setSlug(event.target.value)} placeholder="slug-vendor" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Buat vendor</button></form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">Vendor & subscription</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Vendor</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Subscription</th><th className="px-5 py-3">Max user</th></tr></thead><tbody className="divide-y divide-slate-100">{vendors.map(vendor => { const subscription = subscriptionByVendor.get(vendor.id); return <tr key={vendor.id}><td className="px-5 py-3"><p className="font-semibold text-slate-800">{vendor.name}</p><p className="text-xs text-slate-500">{vendor.slug}</p></td><td className="px-5 py-3"><select value={vendor.status} onChange={event => void updateVendor(vendor.id, event.target.value as Vendor['status'])} className="rounded-md border border-slate-200 px-2 py-1 text-xs"><option value="active">Active</option><option value="suspended">Suspended</option></select></td><td className="px-5 py-3"><select value={subscription?.plan || 'starter'} onChange={event => void updateSubscription(vendor.id, { plan: event.target.value })} className="rounded-md border border-slate-200 px-2 py-1 text-xs">{planOptions.map(plan => <option key={plan}>{plan}</option>)}</select></td><td className="px-5 py-3"><select value={subscription?.status || 'trial'} onChange={event => void updateSubscription(vendor.id, { status: event.target.value })} className="rounded-md border border-slate-200 px-2 py-1 text-xs">{statusOptions.map(status => <option key={status}>{status}</option>)}</select></td><td className="px-5 py-3"><input type="number" min="1" value={subscription?.max_users || 1} onChange={event => void updateSubscription(vendor.id, { max_users: Number(event.target.value) })} className="w-20 rounded-md border border-slate-200 px-2 py-1 text-xs" /></td></tr> })}</tbody></table></div></section>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">User & membership</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Vendor</th><th className="px-5 py-3">Role</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map(user => <tr key={user.id}><td className="px-5 py-3"><p className="font-semibold text-slate-800">{user.full_name || '-'}</p><p className="text-xs text-slate-500">{user.email}</p></td><td className="px-5 py-3"><select value={user.vendor_id} onChange={event => void updateUserVendor(user, event.target.value)} className="max-w-[220px] rounded-md border border-slate-200 px-2 py-1 text-xs">{vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></td><td className="px-5 py-3"><select value={user.role} onChange={event => void updateUserRole(user.id, event.target.value)} className="rounded-md border border-slate-200 px-2 py-1 text-xs"><option>Admin</option><option>Member</option><option>Kasir</option><option>Superadmin</option></select></td></tr>)}</tbody></table></div></section>
    </div>
  );
}
