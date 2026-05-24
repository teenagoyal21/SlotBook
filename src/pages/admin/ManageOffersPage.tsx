import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getOffers, updateOffer, deleteOffer } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '../../lib/router';
import type { Offer, OfferStatus } from '../../lib/database.types';
import { Plus, CreditCard as Edit, Trash2, Calendar, Tag } from 'lucide-react';

const statusColors: Record<OfferStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Active: 'bg-green-100 text-green-700',
  Paused: 'bg-yellow-100 text-yellow-700',
  Expired: 'bg-red-100 text-red-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function ManageOffersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    if (!user) return;
    setLoading(true);
    getOffers()
      .then(setOffers)
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    setDeleting(id);
    await deleteOffer(id);
    setOffers(o => o.filter(x => x.id !== id));
    setDeleting(null);
  };

  const handleStatusChange = async (id: string, status: OfferStatus) => {
    await updateOffer(id, { status });
    setOffers(o => o.map(x => (x.id === id ? { ...x, status } : x)));
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Offers</h1>
            <p className="text-gray-500 text-sm mt-1">{offers.length} total offers</p>
          </div>
          <button
            onClick={() => navigate('/admin/offers/create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Offer
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No offers yet. Create your first offer!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 text-gray-500 font-medium">Offer</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Category</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Price</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Dates</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(offer => (
                    <tr key={offer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{offer.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Cap: {offer.total_capacity}</p>
                      </td>
                      <td className="p-4 text-gray-600">{offer.category}</td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900">₹{offer.offer_price}</span>
                        <span className="text-xs text-gray-400 ml-1 line-through">₹{offer.original_price}</span>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          {offer.start_date} – {offer.end_date}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={offer.status}
                          onChange={e => handleStatusChange(offer.id, e.target.value as OfferStatus)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[offer.status]}`}
                        >
                          {(['Draft', 'Active', 'Paused', 'Cancelled'] as OfferStatus[]).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/offers/edit/${offer.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
                            disabled={deleting === offer.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
