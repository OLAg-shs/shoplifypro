-- ===========================================
-- EAGLE CHOICE - SUPABASE DATABASE SETUP
-- ===========================================
-- Copy and paste this entire script into the Supabase SQL Editor
-- to set up all tables, indices, and triggers for the Eagle Choice platform

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- USERS TABLE
-- ===========================================
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- hashed password (nullable if using Supabase Auth)
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
DROP TABLE IF EXISTS public.stores CASCADE;
CREATE TABLE public.stores (
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
DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products (
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
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
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
DROP TABLE IF EXISTS public.order_items CASCADE;
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0), -- price at time of purchase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AGENTS TABLE
-- ===========================================
DROP TABLE IF EXISTS public.agents CASCADE;
CREATE TABLE public.agents (
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
-- AUTOMATED STORE STATS TRIGGERS
-- ===========================================

-- Function to recalculate store stats
CREATE OR REPLACE FUNCTION public.recalculate_store_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_store_id UUID;
BEGIN
    -- Determine which store to update
    IF (TG_OP = 'DELETE') THEN
        target_store_id := OLD.store_id;
    ELSE
        target_store_id := NEW.store_id;
    END IF;

    IF target_store_id IS NOT NULL THEN
        UPDATE public.stores
        SET stats = jsonb_build_object(
            'totalProducts', (SELECT count(*) FROM public.products WHERE store_id = target_store_id),
            'totalOrders', (SELECT count(*) FROM public.orders WHERE store_id = target_store_id),
            'totalRevenue', (SELECT COALESCE(sum(total_amount), 0) FROM public.orders WHERE store_id = target_store_id AND order_status != 'cancelled'),
            'lastOrderDate', (SELECT max(created_at) FROM public.orders WHERE store_id = target_store_id)
        )
        WHERE id = target_store_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders: Updates stats on new order, status change, or deletion
DROP TRIGGER IF EXISTS trigger_update_store_stats_orders ON public.orders;
CREATE TRIGGER trigger_update_store_stats_orders
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.recalculate_store_stats();

-- Trigger for products: Updates totalProducts count
DROP TRIGGER IF EXISTS trigger_update_store_stats_products ON public.products;
CREATE TRIGGER trigger_update_store_stats_products
AFTER INSERT OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.recalculate_store_stats();

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
-- COMMENT
-- ===========================================
COMMENT ON DATABASE postgres IS 'Eagle Choice Multi-Seller Ecommerce Platform';
COMMENT ON TABLE public.users IS 'Platform users with roles: admin, seller, buyer, agent';
COMMENT ON TABLE public.stores IS 'Seller storefronts with branding and settings';
COMMENT ON TABLE public.products IS 'Products listed in stores';
COMMENT ON TABLE public.orders IS 'Customer orders';
COMMENT ON TABLE public.order_items IS 'Individual items within orders';
COMMENT ON TABLE public.agents IS 'Agent relationships between users and stores';

-- ===========================================
-- SETUP COMPLETE
-- ===========================================
SELECT 'Database setup complete! Tables created: users, stores, products, orders, order_items, agents' as message;