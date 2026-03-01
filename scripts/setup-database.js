import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ASTRA_PRODUCTS = [
  { title: 'ASTRA Air Max - Black', price: 8999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Premium' },
  { title: 'ASTRA Classic Sneaker', price: 6999, image: 'https://images.unsplash.com/photo-1543163521-7a46d9b819d9?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Classic' },
  { title: 'ASTRA Street Runner', price: 7499, image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: true, category: 'Running' },
  { title: 'ASTRA Urban Kick', price: 7999, image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Urban' },
  { title: 'ASTRA Pro Performance', price: 9499, image: 'https://images.unsplash.com/photo-1507222904046-f55a9d41a76c?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: true, category: 'Performance' },
  { title: 'ASTRA Elite Edition', price: 10999, image: 'https://images.unsplash.com/photo-1544440571-3d034c3f7b4f?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: true, category: 'Elite' },
  { title: 'ASTRA Canvas Low', price: 5999, image: 'https://images.unsplash.com/photo-1495706014551-30ecbc58ae39?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Canvas' },
  { title: 'ASTRA Heritage High', price: 8499, image: 'https://images.unsplash.com/photo-1554521723-9ab0037a2b7b?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Heritage' },
  { title: 'ASTRA Limited Collab', price: 11999, image: 'https://images.unsplash.com/photo-1496072042892-b875e54e92e9?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: true, category: 'Limited' },
  { title: 'ASTRA Comfort Max', price: 7499, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Comfort' },
  { title: 'ASTRA Thunder Strike', price: 8299, image: 'https://images.unsplash.com/photo-1538619666990-846dfb75c91d?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Thunder' },
  { title: 'ASTRA Velocity Plus', price: 7899, image: 'https://images.unsplash.com/photo-1535381052091-f64e55c1ef0f?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Velocity' },
  { title: 'ASTRA Supreme Flow', price: 9199, image: 'https://images.unsplash.com/photo-1527526516999-a7be17e7b0a8?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Supreme' },
  { title: 'ASTRA Victory Lap', price: 8799, image: 'https://images.unsplash.com/photo-1574523520811-cdc6102ec112?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Victory' },
  { title: 'ASTRA Apex Runner', price: 7299, image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: true, category: 'Apex' },
  { title: 'ASTRA Dynasty', price: 9699, image: 'https://images.unsplash.com/photo-1513161455079-7ef1a827f6d5?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Dynasty' },
  { title: 'ASTRA Precision Edge', price: 7699, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Precision' },
  { title: 'ASTRA Horizon', price: 6499, image: 'https://images.unsplash.com/photo-1485927714519-98346bd86e4c?w=400&h=400&fit=crop', sizes: ['6','7','8','9','10','11','12'], is_sold_out: false, category: 'Horizon' },
];

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...');

    // Create products table
    console.log('[v0] Creating products table...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TABLE IF EXISTS products CASCADE;
        
        CREATE TABLE IF NOT EXISTS products (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          title VARCHAR(255) NOT NULL,
          price INTEGER NOT NULL,
          image VARCHAR(1024),
          sizes TEXT[] DEFAULT ARRAY[]::text[],
          is_sold_out BOOLEAN DEFAULT false,
          category VARCHAR(100),
          stock_quantity INTEGER DEFAULT 10
        );

        ALTER TABLE products ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Enable read access for all users" ON products
          FOR SELECT USING (true);
      `
    });

    if (createError && createError.code !== 'PGRST204') {
      console.log('[v0] Table might already exist, continuing with insert...');
    }

    // Clear existing products
    console.log('[v0] Clearing existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', 0);

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('[v0] Error deleting products:', deleteError);
    }

    // Insert products
    console.log('[v0] Inserting ASTRA products...');
    const { data, error: insertError } = await supabase
      .from('products')
      .insert(ASTRA_PRODUCTS)
      .select();

    if (insertError) {
      console.error('[v0] Error inserting products:', insertError);
      process.exit(1);
    }

    console.log(`[v0] Successfully inserted ${data.length} products`);
    console.log('[v0] Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
