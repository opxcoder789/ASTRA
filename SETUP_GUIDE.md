# ASTRA Sneaker Store - Supabase Integration Setup Guide

## Overview
The ASTRA sneaker store is now **fully integrated with Supabase**. All products are stored in the database, and the application uses a REST API to fetch data.

## Architecture

```
┌─────────────────────────────────────────────────┐
│         ASTRA Store Frontend (HTML/CSS/JS)      │
│  - store.html: UI with filters, search, cart    │
│  - store.js: Supabase API integration           │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓ API Calls (/api/products, etc)
┌─────────────────────────────────────────────────┐
│         Node.js/Express Server (server.js)      │
│  - REST API endpoints                           │
│  - Supabase client initialization               │
│  - CORS, static file serving                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓ Query
┌─────────────────────────────────────────────────┐
│         Supabase PostgreSQL Database             │
│  - products table (18 ASTRA products)           │
│  - Filtering, sorting support                   │
│  - Row Level Security (RLS)                     │
└─────────────────────────────────────────────────┘
```

## Quick Setup (2 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web server
- `cors` - Cross-origin requests
- `@supabase/supabase-js` - Supabase client
- `dotenv` - Environment variables

### Step 2: Environment Variables
The `.env.local` file is already configured with your Supabase credentials:
```
SUPABASE_URL=https://clckcouxrbjtxuynwdee.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
POSTGRES_URL=postgres://...
```

### Step 3: Initialize Database
Create the products table and seed 18 ASTRA products:
```bash
npm run setup-db
```

Expected output:
```
[v0] Starting database setup...
[v0] Creating products table...
[v0] Clearing existing products...
[v0] Inserting ASTRA products...
[v0] Successfully inserted 18 products
[v0] Database setup complete!
```

### Step 4: Start the Server
```bash
npm start
```

Server will start on `http://localhost:8000`

```
[v0] ASTRA Store running at http://localhost:8000
[v0] API available at http://localhost:8000/api/products
```

### Step 5: Open Store
Visit: **http://localhost:8000/ASTRA/store.html**

## API Endpoints

### Get All Products
```
GET /api/products
```
**Query Parameters:**
- `category`: Filter by category (Premium, Classic, Running, etc.)
- `minPrice`: Filter by minimum price
- `maxPrice`: Filter by maximum price
- `search`: Search by product title

**Example:**
```
/api/products?minPrice=7000&maxPrice=9000&search=ASTRA
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "ASTRA Air Max - Black",
    "price": 8999,
    "image": "https://...",
    "sizes": ["6","7","8","9","10","11","12"],
    "is_sold_out": false,
    "category": "Premium",
    "stock_quantity": 10
  }
]
```

### Get Single Product
```
GET /api/products/:id
```

### Get All Categories
```
GET /api/categories
```

### Health Check
```
GET /api/health
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  image VARCHAR(1024),
  sizes TEXT[] DEFAULT ARRAY[]::text[],
  is_sold_out BOOLEAN DEFAULT false,
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 10
);
```

### 18 ASTRA Products Seeded
1. ASTRA Air Max - Black (₹8,999)
2. ASTRA Classic Sneaker (₹6,999)
3. ASTRA Street Runner (₹7,499)
4. ASTRA Urban Kick (₹7,999)
5. ASTRA Pro Performance (₹9,499)
6. ASTRA Elite Edition (₹10,999)
7. ASTRA Canvas Low (₹5,999)
8. ASTRA Heritage High (₹8,499)
9. ASTRA Limited Collab (₹11,999)
10. ASTRA Comfort Max (₹7,499)
11. ASTRA Thunder Strike (₹8,299)
12. ASTRA Velocity Plus (₹7,899)
13. ASTRA Supreme Flow (₹9,199)
14. ASTRA Victory Lap (₹8,799)
15. ASTRA Apex Runner (₹7,299)
16. ASTRA Dynasty (₹9,699)
17. ASTRA Precision Edge (₹7,699)
18. ASTRA Horizon (₹6,499)

## Store Features

### Working Features
✅ **Product Display** - All 18 products load from Supabase  
✅ **Filtering** - By availability (in stock/sold out)  
✅ **Price Range Filter** - Under ₹5K, ₹5K-₹7.5K, ₹7.5K-₹10K, Above ₹10K  
✅ **Sorting** - Featured, Price (Low-High), Price (High-Low), A-Z, Z-A  
✅ **Search** - Real-time search across product names  
✅ **Responsive Design** - Mobile, tablet, desktop views  
✅ **Cart System** - Add to cart functionality  
✅ **Product Details** - Full product information  
✅ **Size Selection** - View available sizes  

### No Hardcoded Data
- ❌ All dummy products removed
- ✅ 100% database-driven
- ✅ Easy to add/remove products via Supabase dashboard

## Troubleshooting

### "Cannot GET /api/products"
- Check server is running: `npm start`
- Check .env.local has SUPABASE_URL and SUPABASE_ANON_KEY

### "Error loading products from database"
- Run: `npm run setup-db` to create and seed the database
- Check Supabase credentials in .env.local
- Verify database connection: `GET /api/health`

### Products not showing in UI
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab - `/api/products` should return 200
4. Verify products exist in Supabase dashboard

### Cannot connect to Supabase
- Verify SUPABASE_URL is correct (includes https://)
- Verify SUPABASE_ANON_KEY is valid and complete
- Check .env.local file is in project root
- Restart server after updating .env.local

## File Structure

```
project/
├── server.js                          # Express server with API
├── .env.local                         # Supabase credentials
├── package.json                       # Dependencies
├── scripts/
│   └── setup-database.js             # Database setup script
└── ASTRA/
    ├── store.html                     # Store UI (hardcoded removed)
    ├── store.js                       # Supabase API integration
    ├── index.html
    └── css/
        └── styles.css
```

## Adding New Products

### Via Supabase Dashboard
1. Go to https://app.supabase.com
2. Login with your credentials
3. Select your project
4. Go to SQL Editor
5. Run:
```sql
INSERT INTO products (title, price, image, sizes, category, is_sold_out, stock_quantity)
VALUES (
  'Product Name',
  9999,
  'https://image-url.jpg',
  ARRAY['6','7','8','9','10','11','12'],
  'Category',
  false,
  10
);
```

### Via API (Future Enhancement)
POST /api/products with product data

## Deployment

### Deploy to Vercel
1. Connect GitHub repository
2. Set environment variables in Vercel project settings:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. Deploy with `git push`

## Next Steps

### Phase 2: User Accounts
- Add user authentication
- Save shopping carts to database
- Order history tracking

### Phase 3: Advanced Features
- Product reviews and ratings
- Wishlist functionality
- Admin panel for product management
- Email notifications

### Phase 4: Payments
- Stripe integration
- Payment processing
- Invoice generation

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review browser console (F12)
3. Check Supabase database status
4. Review API response in Network tab

---

**Status:** ✅ Fully Functional - All products from Supabase, zero hardcoded data

