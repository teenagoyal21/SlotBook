import { useEffect, useState, FormEvent } from 'react';
import Navbar from '../../components/Navbar';
import { getOffer, getSlots, createBooking } from '../../lib/api';
import { useParams, useNavigate } from '../../lib/router';
import type { Offer, OfferSlot, Business, Booking } from '../../lib/database.types';
import { ArrowLeft, Calendar, Users, Phone, Mail, User, FileText } from 'lucide-react';

type OfferWithBusiness = Offer & { businesses: Business | null };
type CreatedBooking = Booking & {
  offers: (Offer & { businesses: Business | null }) | null;
  offer_slots: OfferSlot | null;
};

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferWithBusiness | null>(null);
  const [slots, setSlots] = useState<OfferSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<CreatedBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    slot_id: '',
    people_count: '1',
    special_note: '',
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([getOffer(id), getSlots(id)])
      .then(([o, s]) => {
        setOffer(o as OfferWithBusiness);
        const avail = (s as OfferSlot[]).filter(sl => sl.status === 'Available');
        setSlots(avail);
        if (avail.length > 0) setForm(f => ({ ...f, slot_id: avail[0].id }));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await createBooking({
        offer_id: id!,
        slot_id: form.slot_id,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || undefined,
        people_count: parseInt(form.people_count),
        special_note: form.special_note || undefined,
      });
      setBooking(result as CreatedBooking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (booking) {
    return <BookingConfirmation booking={booking} onBack={() => navigate('/')} />;
  }

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
        <div className="text-center py-20"><p className="text-gray-500">Offer not found</p></div>
      </div>
    );
  }

  const selectedSlot = slots.find(s => s.id === form.slot_id);
  const maxPeople = selectedSlot ? selectedSlot.capacity - selectedSlot.booked_count : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(`/offers/${id}`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Offer
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">{offer.title}</h2>
          <p className="text-sm text-gray-500">{offer.businesses?.name}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-2xl font-bold text-gray-900">₹{offer.offer_price}</span>
            <span className="text-sm text-gray-400 line-through">₹{offer.original_price}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Book Your Slot</h1>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          {slots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No available slots for this offer.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400" /> Customer Name *
                </label>
                <input required value={form.customer_name} onChange={e => set('customer_name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Your full name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400" /> Phone Number *
                </label>
                <input required value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="+91 98765 43210" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" /> Email (optional)
                </label>
                <input type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="you@email.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" /> Select Slot *
                </label>
                <div className="space-y-2">
                  {slots.map(slot => (
                    <label key={slot.id}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-colors ${
                        form.slot_id === slot.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <input type="radio" name="slot" value={slot.id} checked={form.slot_id === slot.id}
                        onChange={e => set('slot_id', e.target.value)} className="accent-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{slot.slot_date}</p>
                        <p className="text-xs text-gray-500">
                          {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)} &bull; {slot.capacity - slot.booked_count} seats left
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" /> Number of People *
                </label>
                <input required type="number" min="1" max={Math.min(maxPeople, offer.max_booking_per_customer)}
                  value={form.people_count} onChange={e => set('people_count', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <p className="text-xs text-gray-400 mt-1">Max {offer.max_booking_per_customer} per booking</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-400" /> Special Note (optional)
                </label>
                <textarea rows={2} value={form.special_note} onChange={e => set('special_note', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Any special requirements..." />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">
                {submitting ? 'Confirming Booking...' : `Confirm Booking – ₹${offer.offer_price}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingConfirmation({ booking, onBack }: { booking: CreatedBooking; onBack: () => void }) {
  const offer = booking.offers;
  const slot = booking.offer_slots;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-6">Your slot has been successfully reserved.</p>

          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono font-bold text-blue-600">{booking.booking_reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Offer</span>
              <span className="font-medium text-gray-900">{offer?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Business</span>
              <span className="text-gray-700">{offer?.businesses?.name}</span>
            </div>
            {slot && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Slot</span>
                <span className="text-gray-700">
                  {slot.slot_date} {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Customer</span>
              <span className="text-gray-700">{booking.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">People</span>
              <span className="text-gray-700">{booking.people_count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-green-600">{booking.status}</span>
            </div>
          </div>

          <button onClick={onBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            Browse More Offers
          </button>
        </div>
      </div>
    </div>
  );
}
