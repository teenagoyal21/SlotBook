/*
  # Fix businesses foreign key to reference auth.users

  The businesses table was referencing admin_users (a custom table) but our app
  uses Supabase Auth (auth.users) directly. This migration drops the old FK and
  adds a new one pointing to auth.users.
*/

-- Drop old constraint
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_admin_user_id_fkey;

-- Add new FK pointing to auth.users
ALTER TABLE businesses
  ADD CONSTRAINT businesses_admin_user_id_fkey
  FOREIGN KEY (admin_user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
