-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- hashed password
    role VARCHAR(50) NOT NULL DEFAULT 'buyer', -- admin, seller, buyer, agent
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, active, rejected, suspended
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP WITH TIME ZONE,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STORES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    branding JSONB NOT NULL DEFAULT '{
        "theme": {
            "primaryColor": "#3B82F6",
            "secondaryColor": "#1D4ED8",
            "accentColor": "#06B6D4",
            "backgroundColor": "#FFFFFF",
            "textColor": "#1F2937",
            "fontFamily": "system-ui, sans-serif"
        },
        "assets": {
            "logo": {"url": "", "alt": "", "processed": {"white_background": false}},
            "banner": {"url": "", "alt": "", "processed": {"white_background": false}},
            "customImages": []
        },
        "layout": {
            "showFeaturedProducts": true,
            "productsPerRow": 3,
            "sections": ["hero", "featured", "categories", "new-arrivals"]
        },
        "customContent": {
            "heroSection": "",
            "footerText": "",
            "policies": {
                "refund": "",
                "shipping": "",
                "privacy": ""
            }
        }
    }'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
        "paymentMethods": ["credit_card", "paypal"],
        "shipping": {
            "countriesServed": ["US"],
            "freeShippingThreshold": 50,
            "handlingTime": 3
        },
        "tax": {
            "chargesTax": false,
            "taxRate": 0
        }
    }'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    stats JSONB NOT NULL DEFAULT '{
        "totalProducts": 0,
        "totalOrders": 0,
        "totalRevenue": 0,
        "lastOrderDate": null
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PRODUCTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10, 2) CHECK (compare_price >= 0),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of image objects with processing info
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    variations JSONB DEFAULT '[]'::jsonb, -- Array of variation objects
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    seo JSONB DEFAULT '{
        "metaTitle": "",
        "metaDescription": "",
        "metaKeywords": []
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- ORDERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    shipping_address JSONB NOT NULL, -- {street, city, state, postalCode, country}
    payment_info JSONB NOT NULL, -- {method, transactionId, status}
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    tracking_number VARCHAR(255),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    agent_id UUID REFERENCES public.users(id), -- The agent who facilitated the sale (if any)
    commission_rate DECIMAL(3, 2) DEFAULT 0.00, -- e.g., 0.05 for 5%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- ORDER_ITEMS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0), -- price at time of purchase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AGENTS TABLE (optional, we can derive from users with role='agent' and store association)
-- But let's create a explicit agent table for clarity and additional fields
-- ===========================================
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    commission_rate DECIMAL(3, 2) NOT NULL DEFAULT 0.05, -- 5% default
    is_active BOOLEAN DEFAULT TRUE,
    total_sales DECIMAL(10, 2) DEFAULT 0 CHECK (total_sales >= 0),
    total_commission DECIMAL(10, 2) DEFAULT 0 CHECK (total_commission >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDICES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_published ON public.stores(is_published);
CREATE INDEX IF NOT EXISTS idx_stores_verified ON public.stores(is_verified);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_agent ON public.orders(agent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_agents_user ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_store ON public.agents(store_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================
-- Note: We enable RLS and then create policies. We use the auth.uid() function if using Supabase Auth,
-- but since we are managing our own users table and authentication via JWT in our API,
-- we will rely on our API for enforcement and leave RLS disabled for simplicity.
-- However, if you want to use RLS, you would need to set up the policies below and then enable RLS.

-- For now, we do NOT enable RLS. If you want to enable it, uncomment the ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- and then adjust the policies to use our own JWT claims (which would require a custom function to get the user ID from the token).
-- Given the complexity, and since our API enforces access control, we leave RLS disabled.

-- Uncomment the following lines to enable RLS and then create policies accordingly.
-- However, note that without a proper way to get the current user ID in SQL (from our JWT), 
-- RLS policies would be hard to implement without using Supabase Auth.

-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Example policies (if using Supabase Auth and wanting to restrict to own data):
-- CREATE POLICY "Users can view own data" ON public.users
--     FOR SELECT USING (auth.uid() = id);
-- 
-- CREATE POLICY "Users can update own data" ON public.users
--     FOR UPDATE USING (auth.uid() = id);
-- 
-- ... and so on for each table.

-- Since we are not using Supabase Auth for authentication, we skip RLS for now.
-- If you decide to use Supabase Auth in the future, you would need to:
--   1. Switch to using Supabase Auth for user management (sign up, login, etc.)
--   2. Then enable RLS and use auth.uid() in policies.

-- ===========================================
-- TRIGGERS FOR UPDATING TIMESTAMPS
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table to update the updated_at column
DO $$
DECLARE
    tables VARCHAR[] := ARRAY['users', 'stores', 'products', 'orders', 'order_items', 'agents'];
    tbl VARCHAR;
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- ===========================================
-- INITIAL DATA (OPTIONAL)
-- ===========================================
-- You can insert an initial admin user here if desired.
-- Note: The password should be hashed. Example: 'admin123' hashed with bcrypt.
-- But since we are handling password hashing in our API, we leave it empty.
-- Inserting a user directly here would require a pre-hashed password.
-- We'll leave it to the application to create the first admin via the register endpoint.

-- Example (if you want to insert an admin with a known hashed password):
-- INSERT INTO public.users (id, name, email, password, role, status, is_verified)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'Admin User',
--     'admin@example.com',
--     '$2b$10$...hashed password...', -- Replace with actual bcrypt hash
--     'admin',
--     'active',
--     TRUE
-- );
