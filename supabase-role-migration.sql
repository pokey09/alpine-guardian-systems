-- Alpine Guardian Systems - Role Migration
-- Run this in Supabase SQL Editor to create/fix the Account table with roles

-- Ensure UUID helpers exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Create the Account table if it does not already exist
CREATE TABLE IF NOT EXISTS public."Account" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Make sure required columns/constraints are present for existing tables
ALTER TABLE public."Account" ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public."Account" ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public."Account" ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public."Account" ADD COLUMN IF NOT EXISTS created_date TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public."Account" ALTER COLUMN role SET DEFAULT 'user';
UPDATE public."Account" SET role = 'user' WHERE role IS NULL;
ALTER TABLE public."Account" ALTER COLUMN role SET NOT NULL;
ALTER TABLE public."Account" DROP CONSTRAINT IF EXISTS account_role_check;
ALTER TABLE public."Account" ADD CONSTRAINT account_role_check CHECK (role IN ('user', 'admin'));

-- Recreate unique index on email (handles older schemas without a constraint)
CREATE UNIQUE INDEX IF NOT EXISTS account_email_key ON public."Account"(email);

-- 3) Enable RLS and add policies for owner + admin management
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own account" ON public."Account";
CREATE POLICY "Users can view their own account" ON public."Account"
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all accounts" ON public."Account";
CREATE POLICY "Admins can view all accounts" ON public."Account"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public."Account" admin
            WHERE admin.id = auth.uid() AND admin.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can update their own account" ON public."Account";
CREATE POLICY "Users can update their own account" ON public."Account"
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any account" ON public."Account";
CREATE POLICY "Admins can update any account" ON public."Account"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public."Account" admin
            WHERE admin.id = auth.uid() AND admin.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public."Account" admin
            WHERE admin.id = auth.uid() AND admin.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Anyone can create an account" ON public."Account";
CREATE POLICY "Anyone can create an account" ON public."Account"
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete accounts" ON public."Account";
CREATE POLICY "Admins can delete accounts" ON public."Account"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public."Account" admin
            WHERE admin.id = auth.uid() AND admin.role = 'admin'
        )
    );

-- 4) Helpful index for role lookups
CREATE INDEX IF NOT EXISTS idx_account_role ON public."Account"(role);

-- 5) Backfill Account rows for any existing auth.users
INSERT INTO public."Account" (id, email, full_name, role)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    COALESCE(u.raw_user_meta_data->>'role', 'user')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 7) Admin helper to list auth.users without exposing service role key
--    Uses JWT claim 'role' === 'admin'
CREATE OR REPLACE FUNCTION public.admin_list_auth_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        u.id,
        u.email,
        COALESCE(u.raw_user_meta_data->>'full_name', '') AS full_name,
        COALESCE(u.raw_user_meta_data->>'role', 'user') AS role,
        u.created_at
    FROM auth.users u
    WHERE (auth.jwt() ->> 'role') = 'admin';
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_auth_users() TO authenticated;

-- 6) Final message
DO $$
BEGIN
    RAISE NOTICE 'Account table is present with role column (user/admin).';
    RAISE NOTICE 'Policies applied: owner access + admin management.';
    RAISE NOTICE 'Existing users backfilled into Account.';
END $$;
