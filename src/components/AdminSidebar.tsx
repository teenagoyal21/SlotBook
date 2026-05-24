import { Link, useLocation } from '../lib/router';
import {
  LayoutDashboard,
  Tag,
  Calendar,
  BookOpen,
  Building2,
  ChevronRight,
} from 'lucide-react';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/business', label: 'Business Profile', icon: Building2 },
  { to: '/admin/offers', label: 'Manage Offers', icon: Tag },
  { to: '/admin/slots', label: 'Manage Slots', icon: Calendar },
  { to: '/admin/bookings', label: 'Manage Bookings', icon: BookOpen },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <span className="text-white font-bold text-lg">Admin Panel</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          View Public Site &rarr;
        </Link>
      </div>
    </aside>
  );
}
