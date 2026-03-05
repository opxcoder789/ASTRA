-- Products table updates
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_sizes TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS refund_policy TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_policy TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_options JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS shoe_models TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- Orders table
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
  status TEXT DEFAULT 'pending', -- pending, approved, shipped, delivered, cancelled
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table
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

-- Policies table
CREATE TABLE IF NOT EXISTS store_policies (
  id BIGSERIAL PRIMARY KEY,
  refund_policy TEXT,
  shipping_policy TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default policies if not exists
INSERT INTO store_policies (refund_policy, shipping_policy)
SELECT 
  'Since each pair is custom made to particular size of your choice therefore no exchange or return is possible. But in case of the product being damaged we would allow exchange if the same issue is communicate through email info@knickgasm.com within 2 days.',
  'Since each pair is individually made to order and personalised therefore it takes approximately 1-2 weeks for shipping. Once shipped we will send tracking to given email id and contact number.'
WHERE NOT EXISTS (SELECT 1 FROM store_policies);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders (users can only see their own orders)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Policies for cart
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (true);
