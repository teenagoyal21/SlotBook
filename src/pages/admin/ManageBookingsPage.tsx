import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getBookings, updateBookingStatus } from '../../lib/api';
import type { Booking, BookingStatus } from '../../lib/database.types';
import { BookOpen, Download } from 'lucide-react';

const statusColors: Record<BookingStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
  NoShow: 'bg-gray-100 text-gray-700',
};

type BookingWithRelations = Booking & {
  offers: { title: string; businesses: { name: string } | null } | null;
  offer_slots: { slot_date: string; start_time: string; end_time: string } | null;
};

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getBookings()
      .then(b => setBookings(b as BookingWithRelations[]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    await updateBookingStatus(id, status);
    setBookings(b => b.map(x => (x.id === id ? { ...x, status } : x)));
  };

  const exportCSV = () => {
    const header = 'Reference,Customer,Phone,Offer,Slot Date,Slot Time,People,Status,Created\n';
    const rows = bookings.map(b =>
      [
        b.booking_reference,
        b.customer_name,
        b.customer_phone,
        b.offers?.title ?? '',
        b.offer_slots?.slot_date ?? '',
        b.offer_slots ? `${b.offer_slots.start_time?.slice(0,5)}-${b.offer_slots.end_time?.slice(0,5)}` : '',
        b.people_count,
        b.status,
        b.created_at,
      ].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter
    ? bookings.filter(b => b.status === filter)
    : bookings;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              {(['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'] as BookingStatus[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={exportCSV}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 text-gray-500 font-medium">Reference</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Customer</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Offer</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Slot</th>
                    <th className="text-left p-4 text-gray-500 font-medium">People</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-blue-600">{b.booking_reference}</td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{b.customer_name}</p>
                        <p className="text-xs text-gray-400">{b.customer_phone}</p>
                      </td>
                      <td className="p-4 text-gray-600">{b.offers?.title ?? '-'}</td>
                      <td className="p-4 text-gray-600 text-xs">
                        {b.offer_slots
                          ? `${b.offer_slots.slot_date} ${b.offer_slots.start_time?.slice(0,5)}-${b.offer_slots.end_time?.slice(0,5)}`
                          : '-'}
                      </td>
                      <td className="p-4 text-gray-600">{b.people_count}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={b.status}
                          onChange={e => handleStatusChange(b.id, e.target.value as BookingStatus)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {(['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'] as BookingStatus[]).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
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
