import { Link, useNavigate } from '../lib/router';
import { useAuth } from '../context/AuthContext';
import { adminLogout } from '../lib/api';
import { Tag, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            SlotBook
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Offers</Link>
            {user ? (
              <>
                <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Admin Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(false)}>Offers</Link>
            {user ? (
              <>
                <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="text-sm text-red-600 text-left">Logout</button>
              </>
            ) : (
              <Link to="/admin/login" className="text-sm text-blue-600" onClick={() => setMobileOpen(false)}>Admin Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
