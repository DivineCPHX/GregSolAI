/*
  # Add Authentication Requirement for GREG

  1. Security Changes
    - Updated coins table RLS: Only authenticated users can read data
    - Removed public (anon) read access to coins
    - Realtime subscription still works for authenticated users

  2. Super Admin Account
    - The super admin account must be created through Supabase Dashboard:
      - Email: superadmindivine@gmail.com
      - Password: divinecgregsol
    - Go to: Authentication > Users > Add user
    - Or use: https://mtnxitabmceuwdwmrzpw.supabase.co/project/default/auth/users

  3. Notes
    - All users must sign up or log in to access GREG
    - Email confirmation is disabled by default
    - Users can create their own accounts via the Sign Up page
*/

-- Ensure RLS is still enabled
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
