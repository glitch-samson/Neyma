/*
  # Fix RLS policies for profiles table

  1. Security Issues Fixed
    - Remove infinite recursion in SELECT policies
    - Fix INSERT policy to allow profile creation during signup
    - Simplify admin access policies

  2. Policy Changes
    - Replace recursive admin check with direct role comparison
    - Allow authenticated users to insert their own profile
    - Maintain secure access controls for profile management

  3. Notes
    - Policies now use auth.uid() directly instead of recursive lookups
    - INSERT policy allows profile creation during user registration
    - Admin policies simplified to avoid recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policy that doesn't cause recursion
-- This uses a direct check against the auth.jwt() claims
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN auth.uid() = id THEN true
      WHEN (auth.jwt() ->> 'role')::text = 'admin' THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE 
      WHEN auth.uid() = id THEN true
      WHEN (auth.jwt() ->> 'role')::text = 'admin' THEN true
      ELSE false
    END
  );