import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getDashboardSummary, getRecentBookings } from '../../lib/api';
import type { DashboardSummary, Booking } from '../../lib/database.types';
import {
  TrendingUp, Tag, BookOpen, Users, BarChart2, CheckCircle,
  Clock, AlertCircle,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
  NoShow: 'bg-gray-100 text-gray-700',
};

interface RecentBooking extends Booking {
  offers: { title: string; businesses: { name: string } | null } | null;
  offer_slots: { slot_date: string; start_time: string; end_time: string } | null;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardSummary(), getRecentBookings(8)])
      .then(([s, r]) => {
        setSummary(s);
        setRecent(r as RecentBooking[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = summary
    ? [
        { label: 'Total Offers', value: summary.total_offers, icon: Tag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Offers', value: summary.active_offers, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Bookings', value: summary.total_bookings, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: "Today's Bookings", value: summary.todays_bookings, icon: Clock, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        { label: 'Total Capacity', value: summary.total_capacity, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Booked Seats', value: summary.booked_seats, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Available Seats', value: summary.available_seats, icon: BarChart2, color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Conversion Rate', value: `${summary.conversion_rate}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your offer slot booking system</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className={`inline-flex p-2.5 rounded-xl ${bg} mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 text-gray-500 font-medium">Customer</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Offer</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Slot</th>
                      <th className="text-left p-4 text-gray-500 font-medium">People</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-gray-400">No bookings yet</td>
                      </tr>
                    ) : (
                      recent.map(b => (
                        <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{b.customer_name}</td>
                          <td className="p-4 text-gray-600">{b.offers?.title ?? '-'}</td>
                          <td className="p-4 text-gray-600">
                            {b.offer_slots
                              ? `${b.offer_slots.slot_date} ${b.offer_slots.start_time?.slice(0, 5)} - ${b.offer_slots.end_time?.slice(0, 5)}`
                              : '-'}
                          </td>
                          <td className="p-4 text-gray-600">{b.people_count}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[b.status] ?? ''}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
