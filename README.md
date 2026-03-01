# ASTRA - Born to Crush Land

A modern sneaker e-commerce store with a dynamic product catalog, smooth animations, and multi-language support.

## Features

- **Landing Page** - Hero section with video background and animations
- **Product Store** - Browse and filter sneakers with real-time updates
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Multi-Language** - English and Hindi language support
- **Dynamic Products** - Product listings with filtering, sorting, and search
- **Product Details** - Full product information with sizes and images
- **Shopping Cart** - Add products to cart functionality
- **Smooth Animations** - GSAP and Locomotive Scroll animations

## Quick Start

### Option 1: Node.js Server
```bash
npm install
npm start
```
Then open `http://localhost:8000` in your browser.

### Option 2: Python HTTP Server
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

## File Structure

```
/
├── index.html              # Landing page with hero section
├── ASTRA/
│   ├── store.html         # Product store page
│   ├── store.js           # Store functionality
│   ├── styles.css         # Store styles
│   ├── contact.html       # Contact page
│   └── returns.html       # Returns page
├── backend/
│   ├── api.js             # Supabase API functions
│   ├── config.js          # Configuration
│   └── supabase-schema.sql # Database schema
├── admin/                  # Admin panel files
├── main.js                # Main app functionality
├── styles.css             # Global styles
└── package.json           # Project dependencies
```

## Database Setup (Optional)

To connect to a Supabase database:

1. Update `backend/config.js` with your Supabase credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY',
       buckets: {
           productImages: 'product-images',
           heroVideos: 'hero-videos',
           landingCards: 'landing-cards'
       }
   };
   ```

2. Run the database setup:
   ```bash
   # Import the schema from supabase-schema.sql
   ```

The app currently uses mock products that work without a database, but you can integrate Supabase for full functionality.

## Adding Products

Edit `ASTRA/store.html` and update the products array:

```javascript
const products = [
    { 
        id:'1',
        title:'ASTRA Air Max - Black',
        price:8999,
        image:'https://images.unsplash.com/...',
        isSoldOut:false,
        sizes:['6','7','8','9','10','11','12'],
        soldOutSizes:['11','12']
    },
    // ... more products
];
```

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --bg-body: #050505;
    --accent-green: #00FF9D;
    --accent-blue: #00C2FF;
}
```

### Content
- Hero text: Edit `.hero h1` and `.hero p` in `index.html`
- Store title: Edit `collection-title` in `ASTRA/store.html`
- Footer: Edit footer sections in respective HTML files

### Languages
- Add translations in `main.js` functions:
  - `applyHindiTranslations()`
  - `applyEnglishTranslations()`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Optimized images with lazy loading
- GSAP animations for smooth performance
- Service worker for offline support
- Cached external libraries (CDN)

## Deployment

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
netlify deploy
```

## Troubleshooting

### Products not showing
- Check browser console for errors
- Verify store.html has the correct product data
- Ensure images are accessible

### Animations not working
- Check that GSAP and ScrollTrigger libraries loaded
- Verify JavaScript files are in the correct paths
- Clear browser cache and reload

### Database connection issues
- Verify Supabase credentials in config.js
- Check network tab for API errors
- Ensure your database has the required tables

## License

MIT License - Feel free to use this project for commercial or personal use.

## Support

For issues or questions, check the admin panel at `/admin/index.html` (password: 1223)
