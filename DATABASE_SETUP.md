# Database Setup Instructions

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Setup Database and Seed Products
```bash
npm run setup-db
```

This command will:
1. Connect to Supabase using credentials in `.env.local`
2. Create the `products` table with proper schema
3. Clear any existing products
4. Insert all 18 ASTRA sneaker products

Expected output:
```
[v0] Starting database setup...
[v0] Creating products table...
[v0] Clearing existing products...
[v0] Inserting ASTRA products...
[v0] Successfully inserted 18 products
[v0] Database setup complete!
```

## Step 3: Verify Database Setup

### Option A: Via API
```bash
curl http://localhost:8000/api/products
```

You should receive JSON with all 18 products.

### Option B: Via Supabase Dashboard
1. Go to https://app.supabase.com
2. Login with your account
3. Select project "clckcouxrbjtxuynwdee"
4. Go to Table Editor
5. You should see `products` table with 18 rows

## What Was Created

### Products Table Schema
```sql
CREATE TABLE products (
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
```

### Row Level Security (RLS)
- ✅ Public read access (SELECT) enabled for all users
- ✅ Inserts/updates/deletes protected (service role only)

### Seeded Products
| ID | Product | Price | Status |
|----|---------|-------|--------|
| 1 | ASTRA Air Max - Black | ₹8,999 | In Stock |
| 2 | ASTRA Classic Sneaker | ₹6,999 | In Stock |
| 3 | ASTRA Street Runner | ₹7,499 | Sold Out |
| 4 | ASTRA Urban Kick | ₹7,999 | In Stock |
| 5 | ASTRA Pro Performance | ₹9,499 | Sold Out |
| 6 | ASTRA Elite Edition | ₹10,999 | Sold Out |
| 7 | ASTRA Canvas Low | ₹5,999 | In Stock |
| 8 | ASTRA Heritage High | ₹8,499 | In Stock |
| 9 | ASTRA Limited Collab | ₹11,999 | Sold Out |
| 10 | ASTRA Comfort Max | ₹7,499 | In Stock |
| 11 | ASTRA Thunder Strike | ₹8,299 | In Stock |
| 12 | ASTRA Velocity Plus | ₹7,899 | In Stock |
| 13 | ASTRA Supreme Flow | ₹9,199 | In Stock |
| 14 | ASTRA Victory Lap | ₹8,799 | In Stock |
| 15 | ASTRA Apex Runner | ₹7,299 | Sold Out |
| 16 | ASTRA Dynasty | ₹9,699 | In Stock |
| 17 | ASTRA Precision Edge | ₹7,699 | In Stock |
| 18 | ASTRA Horizon | ₹6,499 | In Stock |

## Troubleshooting Setup

### "FATAL: password authentication failed"
- Verify POSTGRES_URL in .env.local is correct
- Check credentials are not expired
- Try re-generating credentials in Supabase dashboard

### "Could not find products table"
- Ensure setup script completed successfully
- Check Supabase dashboard for table creation
- Run setup-db again: `npm run setup-db`

### "No products returned from API"
- Verify API is running: `npm start`
- Check database connection: `curl http://localhost:8000/api/health`
- Verify products were inserted in Supabase dashboard

## Next: Start the Server

Once database is setup:
```bash
npm start
```

Then visit: **http://localhost:8000/ASTRA/store.html**

