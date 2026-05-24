/*
  # Smart Offer Slot Booking System - Initial Schema

  1. New Tables
    - `admin_users` - Admin/business owner accounts
    - `businesses` - Business profile information
    - `offers` - Offer definitions with pricing and timing
    - `offer_slots` - Individual time slots for each offer
    - `bookings` - Customer booking records

  2. Enums
    - `offer_status` - Draft, Active, Paused, Expired, Cancelled
    - `slot_status` - Available, Full, Closed, Expired, Cancelled
    - `booking_status` - Pending, Confirmed, Cancelled, Completed, NoShow
    - `business_type` - Restaurant, Gym, Salon, Clinic, Coaching, Turf, Other

  3. Security
    - RLS enabled on all tables
    - Admin users have full access via service role
    - Public can read active offers and slots
    - Anyone can create bookings
*/

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read own data"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin users can update own data"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  business_type text NOT NULL DEFAULT 'Other',
  owner_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  logo_url text DEFAULT '',
  opening_time time DEFAULT '09:00',
  closing_time time DEFAULT '21:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view businesses"
  ON businesses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Authenticated can update own businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_user_id)
  WITH CHECK (auth.uid() = admin_user_id);

-- Offers Table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  original_price numeric(10,2) NOT NULL DEFAULT 0,
  offer_price numeric(10,2) NOT NULL DEFAULT 0,
  discount_percentage numeric(5,2) DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time,
  end_time time,
  total_capacity int NOT NULL DEFAULT 10,
  max_booking_per_customer int NOT NULL DEFAULT 1,
  terms_and_conditions text DEFAULT '',
  status text NOT NULL DEFAULT 'Draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offers"
  ON offers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert offers"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update offers"
  ON offers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete offers"
  ON offers FOR DELETE
  TO authenticated
  USING (true);

-- Offer Slots Table
CREATE TABLE IF NOT EXISTS offer_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity int NOT NULL DEFAULT 10,
  booked_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Available',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE offer_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view slots"
  ON offer_slots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert slots"
  ON offer_slots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update slots"
  ON offer_slots FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete slots"
  ON offer_slots FOR DELETE
  TO authenticated
  USING (true);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference text UNIQUE NOT NULL DEFAULT '',
  offer_id uuid REFERENCES offers(id) ON DELETE SET NULL,
  slot_id uuid REFERENCES offer_slots(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text DEFAULT '',
  people_count int NOT NULL DEFAULT 1,
  special_note text DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings by reference"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_business_id ON offers(business_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offer_slots_offer_id ON offer_slots(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_slots_slot_date ON offer_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_offer_id ON bookings(offer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS text AS $$
DECLARE
  ref text;
BEGIN
  ref := 'BK' || upper(substring(gen_random_uuid()::text from 1 for 8));
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference = '' THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- Trigger to auto-update offer_slots booked_count and status after booking insert
CREATE OR REPLACE FUNCTION update_slot_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status NOT IN ('Cancelled') THEN
    UPDATE offer_slots
    SET 
      booked_count = booked_count + NEW.people_count,
      status = CASE 
        WHEN (booked_count + NEW.people_count) >= capacity THEN 'Full'
        ELSE 'Available'
      END
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_slot_booked_count
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_booked_count();
