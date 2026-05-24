import { Tag, MapPin, Users, Clock } from 'lucide-react';
import type { Offer } from '../lib/database.types';
import CountdownTimer from './CountdownTimer';
import { Link } from '../lib/router';

interface OfferCardProps {
  offer: Offer & { businesses?: { name: string; city: string; business_type: string } | null };
  availableSlots?: number;
}

export default function OfferCard({ offer, availableSlots = 0 }: OfferCardProps) {
  const discount = Math.round(
    ((offer.original_price - offer.offer_price) / offer.original_price) * 100
  );

  const businessTypeColors: Record<string, string> = {
    Restaurant: 'bg-orange-100 text-orange-700',
    Gym: 'bg-green-100 text-green-700',
    Salon: 'bg-pink-100 text-pink-700',
    Clinic: 'bg-blue-100 text-blue-700',
    Coaching: 'bg-yellow-100 text-yellow-700',
    Turf: 'bg-emerald-100 text-emerald-700',
    Other: 'bg-gray-100 text-gray-700',
  };

  const typeColor =
    businessTypeColors[offer.businesses?.business_type ?? 'Other'] || businessTypeColors['Other'];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="relative bg-gradient-to-br from-blue-50 to-slate-100 h-36 flex items-center justify-center">
        <Tag className="w-12 h-12 text-blue-300" />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor}`}>
            {offer.businesses?.business_type ?? 'Other'}
          </span>
        </div>
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs text-gray-400 mb-1">{offer.businesses?.name}</p>
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors">
          {offer.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">₹{offer.offer_price}</span>
          <span className="text-sm text-gray-400 line-through">₹{offer.original_price}</span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          {offer.businesses?.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {offer.businesses.city}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {availableSlots} slots left
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <CountdownTimer endDate={offer.end_date} endTime={offer.end_time} />
          </span>
        </div>

        <Link
          to={`/offers/${offer.id}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
