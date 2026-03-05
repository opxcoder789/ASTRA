-- Run this in your Supabase SQL Editor to add missing columns
-- This will NOT fail if columns already exist

-- Add columns to products table (one at a time to avoid errors)
DO $$ 
BEGIN
    -- Add available_sizes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'available_sizes'
    ) THEN
        ALTER TABLE products ADD COLUMN available_sizes TEXT[] DEFAULT '{}';
    END IF;

    -- Add total_stock column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'total_stock'
    ) THEN
        ALTER TABLE products ADD COLUMN total_stock INTEGER DEFAULT 0;
    END IF;

    -- Add refund_policy column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'refund_policy'
    ) THEN
        ALTER TABLE products ADD COLUMN refund_policy TEXT;
    END IF;

    -- Add shipping_policy column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'shipping_policy'
    ) THEN
        ALTER TABLE products ADD COLUMN shipping_policy TEXT;
    END IF;

    -- Add pack_options column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'pack_options'
    ) THEN
        ALTER TABLE products ADD COLUMN pack_options JSONB DEFAULT '[]';
    END IF;

    -- Add shoe_models column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'shoe_models'
    ) THEN
        ALTER TABLE products ADD COLUMN shoe_models TEXT[] DEFAULT '{}';
    END IF;

    -- Add discount_percent column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'discount_percent'
    ) THEN
        ALTER TABLE products ADD COLUMN discount_percent INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  selected_size TEXT,
  selected_pack TEXT,
  selected_shoe_model TEXT,
  personalization_text TEXT,
  personalization_images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create store_policies table if it doesn't exist
CREATE TABLE IF NOT EXISTS store_policies (
  id BIGSERIAL PRIMARY KEY,
  refund_policy TEXT,
  shipping_policy TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default policies if table is empty
INSERT INTO store_policies (refund_policy, shipping_policy)
SELECT 
  'Since each pair is custom made to particular size of your choice therefore no exchange or return is possible. But in case of the product being damaged we would allow exchange if the same issue is communicate through email info@knickgasm.com within 2 days.',
  'Since each pair is individually made to order and personalised therefore it takes approximately 1-2 weeks for shipping. Once shipped we will send tracking to given email id and contact number.'
WHERE NOT EXISTS (SELECT 1 FROM store_policies);

-- Enable Row Level Security (optional, for security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can make these more restrictive)
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on cart_items" ON cart_items;
CREATE POLICY "Allow all operations on cart_items" ON cart_items FOR ALL USING (true) WITH CHECK (true);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'All columns and tables created successfully!';
END $$;
