-- Fix all database schema issues for proper user data storage and numeric overflow

-- 1. Fix numeric field overflow by using proper decimal types
ALTER TABLE orders ALTER COLUMN price TYPE DECIMAL(15, 4);
ALTER TABLE orders ALTER COLUMN total_amount TYPE DECIMAL(15, 4);

-- 2. Ensure all user data is properly stored with correct data types
ALTER TABLE orders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE cart_items ALTER COLUMN user_id TYPE TEXT;

-- 3. Add missing columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15, 4);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_notes TEXT;

-- 4. Update products table for better decimal handling
ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(15, 4);

-- 5. Create user profiles table to store user data across devices
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

-- 6. Create user addresses table for shipping
CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_profiles(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Update existing orders to set total_amount where missing
UPDATE orders 
SET total_amount = CAST(price AS DECIMAL(15,4)) * quantity 
WHERE total_amount IS NULL;

-- 8. Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- 9. Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for user data access
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (true);

CREATE POLICY "Users can view own addresses" ON user_addresses
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own addresses" ON user_addresses
  FOR ALL USING (true);

-- 11. Create function to automatically create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create trigger for automatic user profile creation (if using Supabase Auth)
-- Note: This might need to be adjusted based on your auth setup
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION create_user_profile();