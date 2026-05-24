import { useEffect, useState, FormEvent } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getSlots, getOffers, createSlot, updateSlot, deleteSlot } from '../../lib/api';
import type { OfferSlot, Offer, SlotStatus } from '../../lib/database.types';
import { Plus, Trash2, Calendar, CreditCard as Edit, X, Check } from 'lucide-react';

const statusColors: Record<SlotStatus, string> = {
  Available: 'bg-green-100 text-green-700',
  Full: 'bg-red-100 text-red-700',
  Closed: 'bg-gray-100 text-gray-700',
  Expired: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

interface SlotForm {
  offer_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: string;
  status: SlotStatus;
}

const emptyForm: SlotForm = {
  offer_id: '',
  slot_date: '',
  start_time: '',
  end_time: '',
  capacity: '10',
  status: 'Available',
};

export default function ManageSlotsPage() {
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SlotForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState('');

  const load = () => {
    Promise.all([getSlots(), getOffers()])
      .then(([s, o]) => { setSlots(s as OfferSlot[]); setOffers(o as Offer[]); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = selectedOffer ? slots.filter(s => s.offer_id === selectedOffer) : slots;

  const set = (k: keyof SlotForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        offer_id: form.offer_id,
        slot_date: form.slot_date,
        start_time: form.start_time,
        end_time: form.end_time,
        capacity: parseInt(form.capacity),
        booked_count: 0,
        status: form.status,
      };
      if (editId) {
        const updated = await updateSlot(editId, payload);
        setSlots(s => s.map(x => (x.id === editId ? (updated as OfferSlot) : x)));
      } else {
        const created = await createSlot(payload);
        setSlots(s => [created as OfferSlot, ...s]);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving slot');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (slot: OfferSlot) => {
    setForm({
      offer_id: slot.offer_id,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      capacity: String(slot.capacity),
      status: slot.status,
    });
    setEditId(slot.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slot?')) return;
    await deleteSlot(id);
    setSlots(s => s.filter(x => x.id !== id));
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Slots</h1>
            <p className="text-gray-500 text-sm mt-1">Create and manage time slots for your offers</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">{editId ? 'Edit Slot' : 'Add New Slot'}</h2>
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer *</label>
                  <select required value={form.offer_id} onChange={e => set('offer_id', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="">Select an offer</option>
                    {offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slot Date *</label>
                  <input required type="date" value={form.slot_date} onChange={e => set('slot_date', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time *</label>
                    <input required type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time *</label>
                    <input required type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity *</label>
                  <input required type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as SlotStatus)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    {(['Available', 'Closed', 'Cancelled'] as SlotStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium">
                    {saving ? 'Saving...' : editId ? 'Update' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-4">
          <select value={selectedOffer} onChange={e => setSelectedOffer(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Offers</option>
            {offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No slots yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 text-gray-500 font-medium">Offer</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Time</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Capacity</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Booked</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(slot => {
                    const offer = offers.find(o => o.id === slot.offer_id);
                    return (
                      <tr key={slot.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{offer?.title ?? '-'}</td>
                        <td className="p-4 text-gray-600">{slot.slot_date}</td>
                        <td className="p-4 text-gray-600">{slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}</td>
                        <td className="p-4 text-gray-600">{slot.capacity}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min((slot.booked_count / slot.capacity) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{slot.booked_count}/{slot.capacity}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[slot.status]}`}>
                            {slot.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => startEdit(slot)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(slot.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
