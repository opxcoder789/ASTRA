-- Add additional_images column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}';

-- Update existing products to have empty additional_images array
UPDATE products SET additional_images = '{}' WHERE additional_images IS NULL;