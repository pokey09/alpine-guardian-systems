-- Fix Existing Users - Create Account records for users that don't have them
-- Run this in your Supabase SQL Editor if you have existing users without Account records

-- Insert Account records for all auth.users that don't have an Account yet
INSERT INTO public."Account" (id, email, full_name, role)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    'user'  -- Default all existing users to 'user' role
FROM auth.users u
LEFT JOIN public."Account" a ON u.id = a.id
WHERE a.id IS NULL;

-- Show results
SELECT
    COUNT(*) as total_auth_users,
    (SELECT COUNT(*) FROM public."Account") as total_account_records
FROM auth.users;

-- List all users with their roles
SELECT
    a.id,
    a.email,
    a.full_name,
    a.role,
    u.created_at as signup_date,
    u.email_confirmed_at as email_verified
FROM public."Account" a
JOIN auth.users u ON a.id = u.id
ORDER BY u.created_at DESC;
