/*
  # Seed Sample Business, Offers and Slots

  Adds realistic demo data so the public offer listing page shows content immediately.
  Uses the demo admin user id from auth.users.
*/

DO $$
DECLARE
  admin_id uuid;
  business_id uuid;
  gym_offer_id uuid;
  salon_offer_id uuid;
  restaurant_offer_id uuid;
  turf_offer_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@slotbook.com';

  IF admin_id IS NULL THEN
    RETURN;
  END IF;

  -- Create Business
  INSERT INTO businesses (id, admin_user_id, name, business_type, owner_name, phone, email, address, city, opening_time, closing_time)
  VALUES (gen_random_uuid(), admin_id, 'FitZone Gym & Wellness', 'Gym', 'Rajesh Kumar', '+91 98765 43210', 'fitzone@example.com', '12 MG Road', 'Bangalore', '06:00', '22:00')
  RETURNING id INTO business_id;

  -- Gym Trial Offer
  INSERT INTO offers (id, business_id, title, description, category, original_price, offer_price, discount_percentage, start_date, end_date, total_capacity, max_booking_per_customer, terms_and_conditions, status)
  VALUES (
    gen_random_uuid(), business_id,
    'Afternoon Gym Trial', 'Experience our state-of-the-art gym with professional trainers. Includes access to all equipment, locker room, and a free protein shake!',
    'Fitness', 499, 99, 80.2,
    CURRENT_DATE, CURRENT_DATE + 30,
    20, 1,
    'Valid for first-time visitors only. Non-transferable. Must present this booking on arrival.',
    'Active'
  )
  RETURNING id INTO gym_offer_id;

  INSERT INTO offer_slots (offer_id, slot_date, start_time, end_time, capacity, booked_count, status)
  VALUES
    (gym_offer_id, CURRENT_DATE + 1, '10:00', '11:00', 10, 3, 'Available'),
    (gym_offer_id, CURRENT_DATE + 1, '15:00', '17:00', 20, 8, 'Available'),
    (gym_offer_id, CURRENT_DATE + 2, '07:00', '08:00', 15, 0, 'Available'),
    (gym_offer_id, CURRENT_DATE + 2, '17:00', '18:00', 10, 10, 'Full');

  -- Salon Offer
  INSERT INTO offers (id, business_id, title, description, category, original_price, offer_price, discount_percentage, start_date, end_date, total_capacity, max_booking_per_customer, terms_and_conditions, status)
  VALUES (
    gen_random_uuid(), business_id,
    'Salon Happy Hour Deal', 'Premium haircut + wash + styling by our expert stylists. Walk out looking your best!',
    'Beauty', 800, 299, 62.6,
    CURRENT_DATE, CURRENT_DATE + 14,
    15, 1,
    'Appointment required. Includes hair wash and basic styling only. Color services extra.',
    'Active'
  )
  RETURNING id INTO salon_offer_id;

  INSERT INTO offer_slots (offer_id, slot_date, start_time, end_time, capacity, booked_count, status)
  VALUES
    (salon_offer_id, CURRENT_DATE + 1, '11:00', '13:00', 5, 1, 'Available'),
    (salon_offer_id, CURRENT_DATE + 3, '14:00', '16:00', 5, 0, 'Available');

  -- Restaurant Offer
  INSERT INTO offers (id, business_id, title, description, category, original_price, offer_price, discount_percentage, start_date, end_date, total_capacity, max_booking_per_customer, terms_and_conditions, status)
  VALUES (
    gen_random_uuid(), business_id,
    'Lunch Hour Buffet Deal', 'All-you-can-eat lunch buffet with 30+ dishes including desserts. Perfect for office teams!',
    'Food & Drink', 650, 249, 61.7,
    CURRENT_DATE, CURRENT_DATE + 7,
    30, 4,
    'Valid for lunch hours only (12 PM - 3 PM). Beverages not included. Booking required.',
    'Active'
  )
  RETURNING id INTO restaurant_offer_id;

  INSERT INTO offer_slots (offer_id, slot_date, start_time, end_time, capacity, booked_count, status)
  VALUES
    (restaurant_offer_id, CURRENT_DATE + 1, '12:00', '15:00', 30, 12, 'Available'),
    (restaurant_offer_id, CURRENT_DATE + 2, '12:00', '15:00', 30, 0, 'Available');

  -- Turf Offer
  INSERT INTO offers (id, business_id, title, description, category, original_price, offer_price, discount_percentage, start_date, end_date, total_capacity, max_booking_per_customer, terms_and_conditions, status)
  VALUES (
    gen_random_uuid(), business_id,
    'Morning Turf Slot Special', 'Book the full-sized 5v5 turf for your team match. Includes complimentary water bottles and referee.',
    'Sports', 1500, 699, 53.4,
    CURRENT_DATE, CURRENT_DATE + 21,
    10, 1,
    'Each booking is for 1 hour. Team of max 10 players. Bring your own jerseys.',
    'Active'
  )
  RETURNING id INTO turf_offer_id;

  INSERT INTO offer_slots (offer_id, slot_date, start_time, end_time, capacity, booked_count, status)
  VALUES
    (turf_offer_id, CURRENT_DATE + 1, '06:00', '07:00', 1, 0, 'Available'),
    (turf_offer_id, CURRENT_DATE + 1, '07:00', '08:00', 1, 0, 'Available'),
    (turf_offer_id, CURRENT_DATE + 2, '06:00', '07:00', 1, 0, 'Available');

END $$;
