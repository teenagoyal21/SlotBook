import { supabase } from './supabase';
import type { Business, Offer, OfferSlot, Booking, BookingStatus, OfferStatus } from './database.types';

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function adminLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function adminRegister(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw error;
  return data;
}

// ─── Business ────────────────────────────────────────────────────────────────

export async function getBusiness(adminUserId: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('admin_user_id', adminUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createBusiness(business: Omit<Business, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('businesses').insert(business).select().single();
  if (error) throw error;
  return data;
}

export async function updateBusiness(id: string, business: Partial<Business>) {
  const { data, error } = await supabase
    .from('businesses')
    .update({ ...business, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export async function getOffers(filters?: { status?: string; businessId?: string }) {
  let query = supabase.from('offers').select('*, businesses(*)').order('created_at', { ascending: false });
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.businessId) query = query.eq('business_id', filters.businessId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPublicOffers(filters?: {
  businessType?: string;
  category?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
}) {
  let query = supabase
    .from('offers')
    .select('*, businesses(*)')
    .eq('status', 'Active')
    .order('created_at', { ascending: false });

  if (filters?.businessType) query = query.eq('businesses.business_type', filters.businessType);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.minPrice !== undefined) query = query.gte('offer_price', filters.minPrice);
  if (filters?.maxPrice !== undefined) query = query.lte('offer_price', filters.maxPrice);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getOffer(id: string) {
  const { data, error } = await supabase
    .from('offers')
    .select('*, businesses(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createOffer(offer: Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'businesses'>) {
  const { data, error } = await supabase.from('offers').insert(offer).select().single();
  if (error) throw error;
  return data;
}

export async function updateOffer(id: string, offer: Partial<Offer>) {
  const { data, error } = await supabase
    .from('offers')
    .update({ ...offer, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOffer(id: string) {
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw error;
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export async function getSlots(offerId?: string) {
  let query = supabase.from('offer_slots').select('*, offers(*)').order('slot_date').order('start_time');
  if (offerId) query = query.eq('offer_id', offerId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createSlot(slot: Omit<OfferSlot, 'id' | 'created_at' | 'offers'>) {
  const { data, error } = await supabase.from('offer_slots').insert(slot).select().single();
  if (error) throw error;
  return data;
}

export async function updateSlot(id: string, slot: Partial<OfferSlot>) {
  const { data, error } = await supabase.from('offer_slots').update(slot).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSlot(id: string) {
  const { error } = await supabase.from('offer_slots').delete().eq('id', id);
  if (error) throw error;
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, offers(*, businesses(*)), offer_slots(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBooking(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, offers(*, businesses(*)), offer_slots(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getBookingByReference(ref: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, offers(*, businesses(*)), offer_slots(*)')
    .eq('booking_reference', ref)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createBooking(booking: {
  offer_id: string;
  slot_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  people_count: number;
  special_note?: string;
}) {
  // Validate: check slot availability
  const { data: slot, error: slotError } = await supabase
    .from('offer_slots')
    .select('*, offers(*)')
    .eq('id', booking.slot_id)
    .single();
  if (slotError) throw slotError;
  if (!slot) throw new Error('Slot not found');
  if (slot.status !== 'Available') throw new Error('This slot is not available for booking');
  if (slot.booked_count + booking.people_count > slot.capacity) throw new Error('Not enough seats available');

  // Validate: check offer is active and not expired
  const offer = slot.offers as Offer;
  if (!offer) throw new Error('Offer not found');
  if (offer.status !== 'Active') throw new Error('This offer is not active');
  const today = new Date().toISOString().split('T')[0];
  if (offer.end_date < today) throw new Error('This offer has expired');

  // Validate: check booking limit per customer
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('people_count')
    .eq('offer_id', booking.offer_id)
    .eq('customer_phone', booking.customer_phone)
    .not('status', 'eq', 'Cancelled');

  const totalBooked = existingBookings?.reduce((sum, b) => sum + b.people_count, 0) ?? 0;
  if (totalBooked + booking.people_count > offer.max_booking_per_customer) {
    throw new Error(`You can only book up to ${offer.max_booking_per_customer} spot(s) for this offer`);
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...booking, status: 'Confirmed' })
    .select('*, offers(*, businesses(*)), offer_slots(*)')
    .single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardSummary() {
  const today = new Date().toISOString().split('T')[0];

  const [offersRes, bookingsRes, slotsRes, todayBookingsRes] = await Promise.all([
    supabase.from('offers').select('id, status'),
    supabase.from('bookings').select('id, people_count, status'),
    supabase.from('offer_slots').select('capacity, booked_count'),
    supabase.from('bookings').select('id, people_count').gte('created_at', today + 'T00:00:00').lte('created_at', today + 'T23:59:59'),
  ]);

  const offers = offersRes.data ?? [];
  const bookings = bookingsRes.data ?? [];
  const slots = slotsRes.data ?? [];
  const todayBookings = todayBookingsRes.data ?? [];

  const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
  const bookedSeats = slots.reduce((sum, s) => sum + s.booked_count, 0);

  return {
    total_offers: offers.length,
    active_offers: offers.filter(o => o.status === 'Active').length,
    total_bookings: bookings.length,
    todays_bookings: todayBookings.length,
    total_capacity: totalCapacity,
    booked_seats: bookedSeats,
    available_seats: totalCapacity - bookedSeats,
    conversion_rate: totalCapacity > 0 ? Math.round((bookedSeats / totalCapacity) * 100) : 0,
  };
}

export async function getRecentBookings(limit = 10) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, offers(title, businesses(name)), offer_slots(slot_date, start_time, end_time)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export { type OfferStatus, type BookingStatus };
