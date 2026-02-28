-- =====================================================
-- SUPABASE SQL SCHEMA FOR ASTRA STORE
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    is_sold_out BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. PRODUCT COLORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PRODUCT IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    color_id UUID REFERENCES product_colors(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. LANDING PAGE HERO VIDEOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hero_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_url TEXT NOT NULL,
    video_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. LANDING PAGE CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url TEXT,
    card_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ADMIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 7. SITE SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX idx_hero_videos_order ON hero_videos(video_order);
CREATE INDEX idx_landing_cards_order ON landing_cards(card_order);

-- =====================================================
-- INSERT DEFAULT ADMIN USER
-- Password: 1223 (hashed with bcrypt)
-- =====================================================
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere')
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Public can view product colors" ON product_colors
    FOR SELECT USING (true);

CREATE POLICY "Public can view product images" ON product_images
    FOR SELECT USING (true);

CREATE POLICY "Public can view hero videos" ON hero_videos
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view landing cards" ON landing_cards
    FOR SELECT USING (is_active = true);

-- Admin full access (you'll need to implement auth check)
CREATE POLICY "Admin full access products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access colors" ON product_colors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access images" ON product_images
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access videos" ON hero_videos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access cards" ON landing_cards
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- =====================================================
-- Create storage bucket for product images
-- Bucket name: product-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Create storage bucket for hero videos
-- Bucket name: hero-videos
-- Public: true
-- File size limit: 50MB
-- Allowed MIME types: video/mp4, video/webm

-- Create storage bucket for landing cards
-- Bucket name: landing-cards
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
