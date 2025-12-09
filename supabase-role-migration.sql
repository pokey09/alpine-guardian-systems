-- Add role column to Account table
-- Run this in your Supabase SQL Editor

-- Add role column with default value 'user'
ALTER TABLE public."Account"
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_account_role ON public."Account"(role);

-- Update RLS policies to allow admins full access
DROP POLICY IF EXISTS "Admins can view all accounts" ON public."Account";
CREATE POLICY "Admins can view all accounts" ON public."Account"
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public."Account"
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant admin access to orders
DROP POLICY IF EXISTS "Users can view their own orders or admins can view all" ON public."Order";
CREATE POLICY "Users can view their own orders or admins can view all" ON public."Order"
    FOR SELECT USING (
        auth.email() = customer_email OR
        EXISTS (
            SELECT 1 FROM public."Account"
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant admin access to update orders
DROP POLICY IF EXISTS "Only authenticated users can update orders" ON public."Order";
CREATE POLICY "Admins can update orders" ON public."Order"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public."Account"
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant admin access to products
DROP POLICY IF EXISTS "Only authenticated users can insert products" ON public."Product";
CREATE POLICY "Admins can insert products" ON public."Product"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public."Account"
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only authenticated users can update products" ON public."Product";
CREATE POLICY "Admins can update products" ON public."Product"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public."Account"
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only authenticated users can delete products" ON public."Product";
CREATE POLICY "Admins can delete products" ON public."Product"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public."Account"
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to automatically create Account record when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."Account" (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user'  -- Default role is 'user'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public."Account".full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create Account record automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also handle email confirmation updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update Account table if user data changes
    UPDATE public."Account"
    SET
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Role migration completed successfully!';
    RAISE NOTICE '📝 To make a user an admin, run:';
    RAISE NOTICE 'UPDATE public."Account" SET role = ''admin'' WHERE email = ''your-email@example.com'';';
END $$;
