import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { createOffer, updateOffer, getOffer, getBusiness } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from '../../lib/router';
import type { OfferStatus } from '../../lib/database.types';
import { Tag, ArrowLeft } from 'lucide-react';

const categories = ['Food & Drink', 'Fitness', 'Beauty', 'Health', 'Education', 'Sports', 'Entertainment', 'Other'];
const statuses: OfferStatus[] = ['Draft', 'Active', 'Paused'];

interface OfferForm {
  business_id: string;
  title: string;
  description: string;
  category: string;
  original_price: string;
  offer_price: string;
  discount_percentage: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  total_capacity: string;
  max_booking_per_customer: string;
  terms_and_conditions: string;
  status: OfferStatus;
}

const empty: OfferForm = {
  business_id: '',
  title: '',
  description: '',
  category: 'Other',
  original_price: '',
  offer_price: '',
  discount_percentage: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  total_capacity: '10',
  max_booking_per_customer: '1',
  terms_and_conditions: '',
  status: 'Draft',
};

export default function CreateOfferPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState<OfferForm>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    if (!user) return;
    getBusiness(user.id).then(b => {
      if (b) {
        setBusinessId(b.id);
        setForm(f => ({ ...f, business_id: b.id }));
      }
    });
    if (isEdit && id) {
      getOffer(id).then(o => {
        if (o) {
          setForm({
            business_id: o.business_id,
            title: o.title,
            description: o.description,
            category: o.category,
            original_price: String(o.original_price),
            offer_price: String(o.offer_price),
            discount_percentage: String(o.discount_percentage),
            start_date: o.start_date,
            end_date: o.end_date,
            start_time: o.start_time ?? '',
            end_time: o.end_time ?? '',
            total_capacity: String(o.total_capacity),
            max_booking_per_customer: String(o.max_booking_per_customer),
            terms_and_conditions: o.terms_and_conditions,
            status: o.status,
          });
        }
      });
    }
  }, [user, id, isEdit]);

  const set = (k: keyof OfferForm, v: string) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'original_price' || k === 'offer_price') {
        const orig = parseFloat(k === 'original_price' ? v : f.original_price) || 0;
        const offer = parseFloat(k === 'offer_price' ? v : f.offer_price) || 0;
        if (orig > 0) next.discount_percentage = String(Math.round(((orig - offer) / orig) * 100));
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (parseFloat(form.offer_price) >= parseFloat(form.original_price)) {
      setError('Offer price must be less than original price');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        business_id: form.business_id || businessId,
        title: form.title,
        description: form.description,
        category: form.category,
        original_price: parseFloat(form.original_price),
        offer_price: parseFloat(form.offer_price),
        discount_percentage: parseFloat(form.discount_percentage) || 0,
        start_date: form.start_date,
        end_date: form.end_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        total_capacity: parseInt(form.total_capacity),
        max_booking_per_customer: parseInt(form.max_booking_per_customer),
        terms_and_conditions: form.terms_and_conditions,
        status: form.status,
      };
      if (isEdit && id) await updateOffer(id, payload);
      else await createOffer(payload);
      navigate('/admin/offers');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        <button onClick={() => navigate('/admin/offers')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Offers
        </button>

        <div className="mb-8 flex items-center gap-3">
          <Tag className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Offer' : 'Create New Offer'}</h1>
            <p className="text-gray-500 text-sm">Fill in the details for your offer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g. Afternoon Gym Trial" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select required value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as OfferStatus)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.original_price} onChange={e => set('original_price', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="499" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.offer_price} onChange={e => set('offer_price', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="99" />
            </div>

            {form.discount_percentage && (
              <div className="md:col-span-2">
                <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  {form.discount_percentage}% discount applied
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date *</label>
              <input required type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date *</label>
              <input required type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
              <input type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
              <input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Capacity *</label>
              <input required type="number" min="1" value={form.total_capacity} onChange={e => set('total_capacity', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Booking Per Customer *</label>
              <input required type="number" min="1" value={form.max_booking_per_customer} onChange={e => set('max_booking_per_customer', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Terms and Conditions</label>
              <textarea rows={3} value={form.terms_and_conditions} onChange={e => set('terms_and_conditions', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate('/admin/offers')}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
              {saving ? 'Saving...' : isEdit ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
