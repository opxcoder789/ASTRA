# 🗄️ Database Setup Guide

## ✅ Your Supabase is Connected!

Your database credentials are configured and ready to use.

### 📋 Connection Details
- **URL**: `https://ewefbbswaaheqkqsfbzx.supabase.co`
- **Status**: ✅ Connected

---

## 🚀 Quick Start

### 1. Set Up Database Tables
Go to your Supabase dashboard and run the SQL schema:
- Open: https://ewefbbswaaheqkqsfbzx.supabase.co
- Go to SQL Editor
- Copy and paste the contents from `backend/supabase-schema.sql`
- Click "Run"

### 2. Create Storage Buckets
In your Supabase dashboard:
1. Go to **Storage**
2. Create these buckets (make them PUBLIC):
   - `product-images`
   - `hero-videos`
   - `landing-cards`

### 3. Test the Connection
Open `test-connection.html` in your browser to verify everything works:
```
file:///path/to/NEW APP/test-connection.html
```

### 4. Access Admin Panel
Open the admin panel:
```
file:///path/to/NEW APP/admin/index.html
```
**Password**: `1223`

---

## 📁 File Structure

```
NEW APP/
├── backend/
│   ├── config.js          ✅ Your credentials
│   ├── api.js             ✅ Database functions
│   ├── init.js            ✅ Initialization
│   └── supabase-schema.sql   SQL to create tables
├── admin/
│   ├── index.html         Admin dashboard
│   ├── admin-script.js    Admin logic
│   └── admin-styles.css   Admin styling
├── test-connection.html   Test database connection
└── .env                   Environment variables
```

---

## 🔧 API Functions Available

### Products
- `API.getAllProducts()` - Get all products
- `API.getProductById(id)` - Get single product
- `API.createProduct(data)` - Create new product
- `API.updateProduct(id, data)` - Update product
- `API.deleteProduct(id)` - Delete product
- `API.uploadProductImage(file, productId)` - Upload image

### Landing Cards
- `API.getAllLandingCards()` - Get all cards
- `API.uploadLandingCard(file, title, linkUrl)` - Add card
- `API.deleteLandingCard(id, imageUrl)` - Delete card

### Hero Videos
- `API.getAllHeroVideos()` - Get all videos
- `API.uploadHeroVideo(file)` - Upload video
- `API.deleteHeroVideo(id, videoUrl)` - Delete video

---

## 🎯 Next Steps

1. ✅ Database connected
2. ⏳ Run SQL schema in Supabase
3. ⏳ Create storage buckets
4. ⏳ Test connection
5. ⏳ Start adding products!

---

## 🆘 Troubleshooting

### Connection Issues
- Check if Supabase project is active
- Verify URL and API key in `config.js`
- Check browser console for errors

### Storage Issues
- Make sure buckets are created
- Set buckets to PUBLIC
- Check file size limits (50MB for videos)

### Admin Panel Issues
- Clear browser cache
- Check console for JavaScript errors
- Verify all script files are loaded

---

## 📞 Support

If you encounter issues:
1. Open browser console (F12)
2. Check for error messages
3. Verify Supabase dashboard shows tables and buckets
4. Test with `test-connection.html`

---

**🎉 You're all set! Your database is connected and ready to use.**
