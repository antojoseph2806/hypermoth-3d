-- Create Admin User Script
-- Run this in Supabase SQL Editor

-- First, you need to sign up through the app or use Supabase Auth API
-- Then run this to upgrade the user to admin:

-- Replace 'admin@example.com' with your actual email
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'admin@example.com';

-- Also update the profiles table
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Verify the admin was created
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@example.com';
