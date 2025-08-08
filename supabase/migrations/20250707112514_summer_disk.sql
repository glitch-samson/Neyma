/*
  # Create Admin Account Setup

  1. Changes Made
    - Remove the problematic profile insertion that violates foreign key constraint
    - Create a function to set up admin after auth user is created
    - Provide clear instructions for manual admin setup

  2. Notes
    - The profiles table has a foreign key to auth.users
    - We cannot create a profile without first having the auth user
    - This migration provides the tools to set up admin properly
*/

-- Create a function to promote a user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the user's role to admin
    UPDATE profiles 
    SET role = 'admin', updated_at = now()
    WHERE email = user_email;
    
    -- Check if the update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    RAISE NOTICE 'User % has been promoted to admin', user_email;
END;
$$;

-- Create a function to check if admin exists
CREATE OR REPLACE FUNCTION check_admin_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM profiles 
    WHERE role = 'admin';
    
    RETURN admin_count > 0;
END;
$$;

-- Instructions for setting up admin (as comments for reference)
/*
  TO SET UP ADMIN ACCOUNT:
  
  1. Go to Supabase Dashboard > Authentication > Users
  2. Click "Add user" and create a user with:
     - Email: admin@timascollection.com (or your preferred admin email)
     - Password: [choose a secure password]
     - Auto Confirm User: YES (check this box)
  
  3. After the user is created, run this SQL in the SQL Editor:
     SELECT promote_user_to_admin('admin@timascollection.com');
  
  4. Verify admin was created:
     SELECT check_admin_exists();
  
  The user will now have admin access to the application.
*/

-- Log that the migration completed successfully
DO $$
BEGIN
    RAISE NOTICE '=== ADMIN SETUP MIGRATION COMPLETED ===';
    RAISE NOTICE 'Functions created: promote_user_to_admin(), check_admin_exists()';
    RAISE NOTICE '';
    RAISE NOTICE 'TO CREATE ADMIN ACCOUNT:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Add user: admin@timascollection.com';
    RAISE NOTICE '3. Run: SELECT promote_user_to_admin(''admin@timascollection.com'');';
    RAISE NOTICE '4. Verify: SELECT check_admin_exists();';
    RAISE NOTICE '===========================================';
END $$;