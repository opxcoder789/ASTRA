-- Complete fix for cart_items and orders tables
-- Run this in your Supabase SQL Editor

-- Drop and recreate cart_items table with all required columns
DROP TABLE IF EXISTS cart_items CASCADE;
CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  selected_size TEXT,
  selected_pack TEXT,
  selected_shoe_model TEXT,
  personalization_text TEXT,
  personalization_images TEXT[],
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate orders table with all required columns including IP
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  product_id BIGINT REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  quantity INTEGER DEFAULT 1,
  selected_size TEXT,
  selected_pack TEXT,
  selected_shoe_model TEXT,
  personalization_text TEXT,
  personalization_images TEXT[],
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  tracking_number TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;

-- Create new policies
CREATE POLICY "Allow all operations on orders" ON orders 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cart_items" ON cart_items 
  FOR ALL USING (true) WITH CHECK (true);

-- Add image upload columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_url_input BOOLEAN DEFAULT true;

-- Add image upload columns to landing_page_content table
ALTER TABLE landing_page_content ADD COLUMN IF NOT EXISTS hero_image_urls TEXT[] DEFAULT '{}';
ALTER TABLE landing_page_content ADD COLUMN IF NOT EXISTS hero_video_url TEXT;

-- Add image upload columns to hero_slides table
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS use_url_input BOOLEAN DEFAULT true;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Cart and Orders tables fixed successfully with IP tracking!';
END $$;
