import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import OfferCard from '../../components/OfferCard';
import { getPublicOffers, getSlots } from '../../lib/api';
import type { Offer, OfferSlot } from '../../lib/database.types';
import { Search, SlidersHorizontal, Tag } from 'lucide-react';

const businessTypes = ['All', 'Restaurant', 'Gym', 'Salon', 'Clinic', 'Coaching', 'Turf', 'Other'];

export default function OfferListingPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    Promise.all([getPublicOffers(), getSlots()])
      .then(([o, s]) => {
        setOffers(o as Offer[]);
        setSlots(s as OfferSlot[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getAvailableSlots = (offerId: string) =>
    slots.filter(s => s.offer_id === offerId && s.status === 'Available').length;

  const filtered = offers.filter(o => {
    if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'All' && (o as Offer & { businesses?: { business_type: string } }).businesses?.business_type !== typeFilter) return false;
    if (categoryFilter && o.category !== categoryFilter) return false;
    if (maxPrice && o.offer_price > parseFloat(maxPrice)) return false;
    if (availableOnly && getAvailableSlots(o.id) === 0) return false;
    return true;
  });

  const categories = [...new Set(offers.map(o => o.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Limited-Time Offers</h1>
          <p className="text-blue-100 text-lg mb-8">Discover exclusive deals from top local businesses</p>
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search offers..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />

          <div className="flex flex-wrap gap-2">
            {businessTypes.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <input
            type="number"
            placeholder="Max Price ₹"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={e => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-600">Available only</span>
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No offers found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">{filtered.length} offer{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer as Offer & { businesses?: { name: string; city: string; business_type: string } }}
                  availableSlots={getAvailableSlots(offer.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
