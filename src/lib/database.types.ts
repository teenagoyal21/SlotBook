export type BusinessType = 'Restaurant' | 'Gym' | 'Salon' | 'Clinic' | 'Coaching' | 'Turf' | 'Other';
export type OfferStatus = 'Draft' | 'Active' | 'Paused' | 'Expired' | 'Cancelled';
export type SlotStatus = 'Available' | 'Full' | 'Closed' | 'Expired' | 'Cancelled';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface Business {
  id: string;
  admin_user_id: string;
  name: string;
  business_type: BusinessType;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  logo_url: string;
  opening_time: string;
  closing_time: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  business_id: string;
  title: string;
  description: string;
  category: string;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  total_capacity: number;
  max_booking_per_customer: number;
  terms_and_conditions: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  businesses?: Business;
}

export interface OfferSlot {
  id: string;
  offer_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: SlotStatus;
  created_at: string;
  offers?: Offer;
}

export interface Booking {
  id: string;
  booking_reference: string;
  offer_id: string;
  slot_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  people_count: number;
  special_note: string;
  status: BookingStatus;
  created_at: string;
  offers?: Offer & { businesses?: Business };
  offer_slots?: OfferSlot;
}

export interface DashboardSummary {
  total_offers: number;
  active_offers: number;
  total_bookings: number;
  todays_bookings: number;
  total_capacity: number;
  booked_seats: number;
  available_seats: number;
  conversion_rate: number;
}

export interface Database {
  public: {
    Tables: {
      admin_users: { Row: AdminUser; Insert: Omit<AdminUser, 'id' | 'created_at'>; Update: Partial<AdminUser> };
      businesses: { Row: Business; Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Business> };
      offers: { Row: Offer; Insert: Omit<Offer, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Offer> };
      offer_slots: { Row: OfferSlot; Insert: Omit<OfferSlot, 'id' | 'created_at'>; Update: Partial<OfferSlot> };
      bookings: { Row: Booking; Insert: Omit<Booking, 'id' | 'booking_reference' | 'created_at'>; Update: Partial<Booking> };
    };
  };
}
