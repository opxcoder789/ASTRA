# ASTRA Store - Quick Start (30 Seconds)

## Three Commands to Get Running

### Step 1: Install
```bash
npm install
```

### Step 2: Setup Database
```bash
npm run setup-db
```

Output should show:
```
[v0] Successfully inserted 18 products
[v0] Database setup complete!
```

### Step 3: Start Server
```bash
npm start
```

Visit: **http://localhost:8000/ASTRA/store.html**

Done! ✅

---

## What You Get

- ✅ **18 ASTRA Sneaker Products** loaded from Supabase
- ✅ **Filter by Availability** (In Stock / Sold Out)
- ✅ **Filter by Price** (5 price brackets)
- ✅ **Sort Products** (By price, alphabetically)
- ✅ **Real-time Search** 
- ✅ **Responsive Design** (Works on mobile, tablet, desktop)
- ✅ **Shopping Cart** (Add to cart)
- ✅ **Zero Hardcoded Data** (All from database)

---

## Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Product Display | ✅ | 18 products from Supabase |
| Filtering | ✅ | Availability + Price ranges |
| Sorting | ✅ | By price, name (A-Z, Z-A) |
| Search | ✅ | Real-time text search |
| Responsive | ✅ | Mobile, tablet, desktop |
| Cart | ✅ | Add/remove items |
| Database | ✅ | Supabase PostgreSQL |
| API | ✅ | RESTful endpoints |

---

## Commands

```bash
# Start development server
npm start

# Setup database and seed products
npm run setup-db

# Check if server is running
curl http://localhost:8000/api/health
```

---

## Test the Store

1. **View Products**
   - Visit http://localhost:8000/ASTRA/store.html
   - Should see 18 products loaded

2. **Filter by Availability**
   - Click dropdown at top-left
   - Select "In Stock" or "Sold Out"
   - Grid updates instantly

3. **Filter by Price**
   - Click price dropdown
   - Select price range
   - Products update

4. **Sort**
   - Click sort dropdown
   - Try "Price: Low to High"
   - Products reorder instantly

5. **Search**
   - Click search icon
   - Type "Elite"
   - See matching products

---

## Supabase Dashboard

View your products directly:
1. Go to https://app.supabase.com
2. Project: `clckcouxrbjtxuynwdee`
3. Table Editor → `products`
4. See all 18 products with details

---

## File Structure

```
project/
├── server.js                    # Express API
├── package.json                 # Dependencies
├── .env.local                   # Supabase credentials
├── scripts/
│   └── setup-database.js       # Database setup
└── ASTRA/
    ├── store.html              # Store UI
    ├── store.js                # API integration
    └── index.html
```

---

## Troubleshooting

### Products not showing?
1. Check: `npm start` is running
2. Run: `npm run setup-db` again
3. Check browser console (F12) for errors

### API Error?
```bash
curl http://localhost:8000/api/health
```
Should return: `{"status":"ok","database":"connected"}`

### Port already in use?
```bash
npm start -- --port 3000
```

---

## Next Steps

After verifying everything works:

1. **Customize** - Modify products in Supabase dashboard
2. **Enhance** - Add checkout, payment processing
3. **Deploy** - Push to Vercel with environment variables
4. **Scale** - Add more products, features, users

---

## Files to Know

- **store.html** - The store display (UI)
- **store.js** - Connects to API and displays products
- **server.js** - The API server (backend)
- **.env.local** - Database credentials (keep secret!)
- **SETUP_GUIDE.md** - Detailed setup instructions
- **ARCHITECTURE.md** - How everything works together

---

## Success Checklist

- [ ] `npm install` completed
- [ ] `npm run setup-db` succeeded
- [ ] `npm start` running
- [ ] 18 products showing in store
- [ ] Filters work
- [ ] Search works
- [ ] Products load from Supabase

✅ **You're good to go!**

---

**Status:** Production Ready  
**Database:** Supabase ✅  
**Server:** Express ✅  
**Frontend:** Fully Integrated ✅  

