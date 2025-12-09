-- Alpine Guardian Systems - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor to set up the complete database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ACCOUNT TABLE (Extends Supabase Auth Users)
-- ============================================================================
-- Note: This table extends the built-in auth.users table
-- You can also just use auth.users directly if you prefer
CREATE TABLE IF NOT EXISTS public."Account" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;

-- Policies for Account table
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

-- Useful index for role lookups
CREATE INDEX IF NOT EXISTS idx_account_role ON public."Account"(role);

-- ============================================================================
-- 2. PRODUCT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public."Product" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image TEXT,
    description TEXT,
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5) DEFAULT 0,
    variations JSONB DEFAULT '[]'::jsonb,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;

-- Policies for Product table
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public."Product";
CREATE POLICY "Products are viewable by everyone" ON public."Product"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only authenticated users can insert products" ON public."Product";
CREATE POLICY "Only authenticated users can insert products" ON public."Product"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can update products" ON public."Product";
CREATE POLICY "Only authenticated users can update products" ON public."Product"
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can delete products" ON public."Product";
CREATE POLICY "Only authenticated users can delete products" ON public."Product"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_rating ON public."Product"(rating DESC);
CREATE INDEX IF NOT EXISTS idx_product_price ON public."Product"(price);

-- ============================================================================
-- 3. ORDER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public."Order" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;

-- Policies for Order table
DROP POLICY IF EXISTS "Users can view their own orders" ON public."Order";
CREATE POLICY "Users can view their own orders" ON public."Order"
    FOR SELECT USING (
        auth.email() = customer_email OR
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Anyone can create an order" ON public."Order";
CREATE POLICY "Anyone can create an order" ON public."Order"
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated users can update orders" ON public."Order";
CREATE POLICY "Only authenticated users can update orders" ON public."Order"
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_order_customer_email ON public."Order"(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_status ON public."Order"(status);
CREATE INDEX IF NOT EXISTS idx_order_created_date ON public."Order"(created_date DESC);

-- ============================================================================
-- 4. REVIEW TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public."Review" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public."Product"(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."Review" ENABLE ROW LEVEL SECURITY;

-- Policies for Review table
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON public."Review";
CREATE POLICY "Approved reviews are viewable by everyone" ON public."Review"
    FOR SELECT USING (status = 'approved' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can create a review" ON public."Review";
CREATE POLICY "Anyone can create a review" ON public."Review"
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated users can update reviews" ON public."Review";
CREATE POLICY "Only authenticated users can update reviews" ON public."Review"
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can delete reviews" ON public."Review";
CREATE POLICY "Only authenticated users can delete reviews" ON public."Review"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_review_product_id ON public."Review"(product_id);
CREATE INDEX IF NOT EXISTS idx_review_status ON public."Review"(status);
CREATE INDEX IF NOT EXISTS idx_review_created_date ON public."Review"(created_date DESC);

-- ============================================================================
-- 5. SITE SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public."SiteSettings" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_url TEXT,
    tagline TEXT,
    contact_email TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."SiteSettings" ENABLE ROW LEVEL SECURITY;

-- Policies for SiteSettings table
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public."SiteSettings";
CREATE POLICY "Site settings are viewable by everyone" ON public."SiteSettings"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only authenticated users can insert site settings" ON public."SiteSettings";
CREATE POLICY "Only authenticated users can insert site settings" ON public."SiteSettings"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can update site settings" ON public."SiteSettings";
CREATE POLICY "Only authenticated users can update site settings" ON public."SiteSettings"
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default site settings (only if none exist)
INSERT INTO public."SiteSettings" (logo_url, tagline, contact_email)
SELECT NULL, 'Your Alpine Guardian Systems', 'contact@alpineguardian.com'
WHERE NOT EXISTS (SELECT 1 FROM public."SiteSettings");

-- ============================================================================
-- TRIGGERS FOR UPDATED_DATE
-- ============================================================================

-- Function to update updated_date
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for Product table
DROP TRIGGER IF EXISTS update_product_updated_date ON public."Product";
CREATE TRIGGER update_product_updated_date
    BEFORE UPDATE ON public."Product"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- Trigger for Order table
DROP TRIGGER IF EXISTS update_order_updated_date ON public."Order";
CREATE TRIGGER update_order_updated_date
    BEFORE UPDATE ON public."Order"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- Trigger for SiteSettings table
DROP TRIGGER IF EXISTS update_sitesettings_updated_date ON public."SiteSettings";
CREATE TRIGGER update_sitesettings_updated_date
    BEFORE UPDATE ON public."SiteSettings"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_date_column();

-- ============================================================================
-- FUNCTION TO UPDATE PRODUCT RATING BASED ON APPROVED REVIEWS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product rating based on approved reviews
    UPDATE public."Product"
    SET rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
        FROM public."Review"
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating when reviews change
DROP TRIGGER IF EXISTS update_product_rating_trigger ON public."Review";
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public."Review"
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

-- ============================================================================
-- SAMPLE DATA (Optional - Remove if you don't want sample data)
-- ============================================================================

-- Sample Products
INSERT INTO public."Product" (name, price, image, description, rating, variations) VALUES
('Alpine Pro Jacket', 199.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5', 'Premium waterproof jacket for extreme conditions', 4.5, '[
    {
        "name": "Size",
        "options": [
            {"value": "S", "price_adjustment": 0},
            {"value": "M", "price_adjustment": 0},
            {"value": "L", "price_adjustment": 0},
            {"value": "XL", "price_adjustment": 10}
        ]
    },
    {
        "name": "Color",
        "options": [
            {"value": "Black", "price_adjustment": 0},
            {"value": "Navy", "price_adjustment": 0},
            {"value": "Red", "price_adjustment": 5}
        ]
    }
]'::jsonb),
('Mountain Boots', 149.99, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0', 'Durable hiking boots with ankle support', 4.8, '[
    {
        "name": "Size",
        "options": [
            {"value": "8", "price_adjustment": 0},
            {"value": "9", "price_adjustment": 0},
            {"value": "10", "price_adjustment": 0},
            {"value": "11", "price_adjustment": 0},
            {"value": "12", "price_adjustment": 5}
        ]
    }
]'::jsonb),
('Trail Backpack', 89.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', '40L capacity backpack with hydration system', 4.6, '[]'::jsonb),
('Camping Tent', 299.99, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4', '4-person weatherproof tent', 4.7, '[
    {
        "name": "Capacity",
        "options": [
            {"value": "2-Person", "price_adjustment": -50},
            {"value": "4-Person", "price_adjustment": 0},
            {"value": "6-Person", "price_adjustment": 100}
        ]
    }
]'::jsonb),
('Sleeping Bag', 79.99, 'https://images.unsplash.com/photo-1519368358672-25b03afee3bf', 'Rated for -10°C with compression sack', 4.3, '[
    {
        "name": "Temperature Rating",
        "options": [
            {"value": "0°C", "price_adjustment": -20},
            {"value": "-10°C", "price_adjustment": 0},
            {"value": "-20°C", "price_adjustment": 30}
        ]
    }
]'::jsonb);

-- Sample Reviews (for the first product)
INSERT INTO public."Review" (product_id, product_name, user_email, user_name, rating, comment, status)
SELECT
    p.id,
    p.name,
    'john@example.com',
    'John Doe',
    5,
    'Excellent jacket! Kept me dry during a week-long trek in heavy rain.',
    'approved'
FROM public."Product" p
WHERE p.name = 'Alpine Pro Jacket'
LIMIT 1;

INSERT INTO public."Review" (product_id, product_name, user_email, user_name, rating, comment, status)
SELECT
    p.id,
    p.name,
    'sarah@example.com',
    'Sarah Smith',
    4,
    'Great quality but a bit pricey. Worth it for serious hikers.',
    'approved'
FROM public."Product" p
WHERE p.name = 'Alpine Pro Jacket'
LIMIT 1;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Alpine Guardian Systems database setup completed successfully!';
    RAISE NOTICE 'Tables created: Account, Product, Order, Review, SiteSettings';
    RAISE NOTICE 'Sample data has been inserted (5 products, 2 reviews)';
    RAISE NOTICE 'Row Level Security policies are enabled on all tables';
END $$;
