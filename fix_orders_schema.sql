-- Fix numeric field overflow by increasing precision
ALTER TABLE orders ALTER COLUMN price TYPE DECIMAL(12, 2);

-- Add total_amount column if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2);

-- Update existing orders to set total_amount
UPDATE orders SET total_amount = price * quantity WHERE total_amount IS NULL;

-- Add order notes for admin
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);
