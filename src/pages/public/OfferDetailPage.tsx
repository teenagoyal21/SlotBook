import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getOffer, getSlots } from '../../lib/api';
import { useParams, useNavigate } from '../../lib/router';
import type { Offer, OfferSlot, Business } from '../../lib/database.types';
import CountdownTimer from '../../components/CountdownTimer';
import {
  MapPin, Clock, Users, Tag, ArrowLeft, ChevronRight,
  CheckCircle, Shield, Calendar,
} from 'lucide-react';

type OfferWithBusiness = Offer & { businesses: Business | null };

export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferWithBusiness | null>(null);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getOffer(id), getSlots(id)])
      .then(([o, s]) => {
        setOffer(o as OfferWithBusiness);
        setSlots(s as OfferSlot[]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500">Offer not found</p>
        </div>
      </div>
    );
  }

  const discount = Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100);
  const availableSlots = slots.filter(s => s.status === 'Available');
  const isExpired = offer.end_date < new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Offers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {offer.category}
                    </span>
                    {discount > 0 && (
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        -{discount}% OFF
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{offer.title}</h1>
                  <p className="text-gray-500 mt-1">{offer.businesses?.name}</p>
                </div>
                <CountdownTimer endDate={offer.end_date} endTime={offer.end_time} />
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{offer.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Offer Price</p>
                  <p className="text-2xl font-bold text-gray-900">₹{offer.offer_price}</p>
                  <p className="text-sm text-gray-400 line-through">₹{offer.original_price}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Available Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{availableSlots.length}</p>
                  <p className="text-sm text-gray-400">of {slots.length} total</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                  <p className="text-base font-bold text-gray-900">{offer.end_date}</p>
                  <p className="text-sm text-gray-400">Max {offer.max_booking_per_customer}/customer</p>
                </div>
              </div>

              {offer.terms_and_conditions && (
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Terms & Conditions</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{offer.terms_and_conditions}</p>
                </div>
              )}
            </div>

            {offer.businesses && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">About the Business</h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{offer.businesses.name}</p>
                      <p className="text-sm text-gray-500">{offer.businesses.business_type}</p>
                    </div>
                  </div>
                  {offer.businesses.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {offer.businesses.address}, {offer.businesses.city}
                    </div>
                  )}
                  {offer.businesses.opening_time && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {offer.businesses.opening_time} – {offer.businesses.closing_time}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Available Slots
              </h2>

              {availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No slots available</p>
                </div>
              ) : (
                <div className="space-y-3 mb-5">
                  {availableSlots.map(slot => (
                    <div key={slot.id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{slot.slot_date}</p>
                          <p className="text-xs text-gray-500">
                            {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{slot.capacity - slot.booked_count} left</p>
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isExpired && availableSlots.length > 0 && offer.status === 'Active' && (
                <button
                  onClick={() => navigate(`/offers/${offer.id}/book`)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Book Slot
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {(isExpired || offer.status !== 'Active') && (
                <div className="text-center py-3 bg-gray-50 rounded-xl text-sm text-gray-500">
                  This offer is no longer available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
