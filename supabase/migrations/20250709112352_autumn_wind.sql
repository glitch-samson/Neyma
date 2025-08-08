/*
  # Add phone number to user profiles

  1. Changes Made
    - Add phone_number column to profiles table
    - Update existing users to have null phone numbers initially
    - Users can update their phone numbers in profile settings

  2. Security
    - No changes to RLS policies needed
    - Phone numbers follow same access patterns as other profile data
*/

-- Add phone_number column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;