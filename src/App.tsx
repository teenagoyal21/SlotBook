import { Router, Routes, Route } from './lib/router';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import BusinessProfilePage from './pages/admin/BusinessProfilePage';
import CreateOfferPage from './pages/admin/CreateOfferPage';
import ManageOffersPage from './pages/admin/ManageOffersPage';
import ManageSlotsPage from './pages/admin/ManageSlotsPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';

import OfferListingPage from './pages/public/OfferListingPage';
import OfferDetailPage from './pages/public/OfferDetailPage';
import BookingPage from './pages/public/BookingPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<OfferListingPage />} />
          <Route path="/offers/:id" element={<OfferDetailPage />} />
          <Route path="/offers/:id/book" element={<BookingPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/business" element={<BusinessProfilePage />} />
          <Route path="/admin/offers" element={<ManageOffersPage />} />
          <Route path="/admin/offers/create" element={<CreateOfferPage />} />
          <Route path="/admin/offers/edit/:id" element={<CreateOfferPage />} />
          <Route path="/admin/slots" element={<ManageSlotsPage />} />
          <Route path="/admin/bookings" element={<ManageBookingsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
