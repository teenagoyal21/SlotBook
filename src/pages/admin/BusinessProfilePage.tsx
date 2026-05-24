import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getBusiness, createBusiness, updateBusiness } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { Business, BusinessType } from '../../lib/database.types';
import { Save, Building2 } from 'lucide-react';

const businessTypes: BusinessType[] = ['Restaurant', 'Gym', 'Salon', 'Clinic', 'Coaching', 'Turf', 'Other'];

const empty: Omit<Business, 'id' | 'created_at' | 'updated_at'> = {
  admin_user_id: '',
  name: '',
  business_type: 'Other',
  owner_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  logo_url: '',
  opening_time: '09:00',
  closing_time: '21:00',
};

export default function BusinessProfilePage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    getBusiness(user.id)
      .then(b => {
        if (b) {
          setBusiness(b);
          setForm(b);
        } else {
          setForm({ ...empty, admin_user_id: user.id });
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (business) {
        const updated = await updateBusiness(business.id, form);
        setBusiness(updated);
        setForm(updated);
      } else {
        const created = await createBusiness({ ...form, admin_user_id: user!.id });
        setBusiness(created);
        setForm(created);
      }
      setMessage('Business profile saved successfully!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Error saving business profile');
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <Building2 className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
            <p className="text-gray-500 text-sm">Manage your business information</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type *</label>
                <select required value={form.business_type} onChange={e => set('business_type', e.target.value as BusinessType)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                  {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Name *</label>
                <input required value={form.owner_name} onChange={e => set('owner_name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                <input required value={form.address} onChange={e => set('address', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                <input required value={form.city} onChange={e => set('city', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL (optional)</label>
                <input value={form.logo_url} onChange={e => set('logo_url', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Opening Time</label>
                <input type="time" value={form.opening_time ?? ''} onChange={e => set('opening_time', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Closing Time</label>
                <input type="time" value={form.closing_time ?? ''} onChange={e => set('closing_time', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
