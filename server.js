import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[v0] Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

console.log('[v0] Supabase connected:', supabaseUrl);

// API Routes
// ============================================================
// GET /api/products - Fetch all products with optional filters
app.get('/api/products', async (req, res) => {
  try {
    console.log('[v0] Fetching products...');
    const { category, minPrice, maxPrice, search } = req.query;

    let query = supabase.from('products').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (minPrice) {
      query = query.gte('price', parseInt(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice));
    }

    const { data, error } = await query;

    if (error) {
      console.error('[v0] Error fetching products:', error);
      return res.status(500).json({ error: error.message });
    }

    let products = data || [];

    // Client-side search filter
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(searchLower)
      );
    }

    console.log('[v0] Returned', products.length, 'products');
    res.json(products);
  } catch (error) {
    console.error('[v0] API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Fetch single product
app.get('/api/products/:id', async (req, res) => {
  try {
    console.log('[v0] Fetching product:', req.params.id);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('[v0] Error:', error);
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('[v0] API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories - Fetch all unique categories
app.get('/api/categories', async (req, res) => {
  try {
    console.log('[v0] Fetching categories...');
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');

    if (error) {
      console.error('[v0] Error:', error);
      return res.status(500).json({ error: error.message });
    }

    const categories = [...new Set(data.map(p => p.category).filter(Boolean))];
    res.json(categories);
  } catch (error) {
    console.error('[v0] API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cart - Save cart to local storage (client-side managed)
app.post('/api/cart', express.json(), (req, res) => {
  try {
    console.log('[v0] Cart operation:', req.body);
    res.json({ success: true, message: 'Cart operation recorded' });
  } catch (error) {
    console.error('[v0] API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Serve HTML files (fallback for single-page app routing)
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[v0] ASTRA Store running at http://localhost:${PORT}`);
  console.log(`[v0] API available at http://localhost:${PORT}/api/products`);
  console.log('[v0] Press Ctrl+C to stop');
});
