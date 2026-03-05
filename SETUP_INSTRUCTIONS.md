# Astra Store - Setup Instructions

## Installation

1. Install dependencies (you need to run this command):
```bash
npm install
```

This will install the new `@clerk/clerk-react` package that was added to package.json.

## Environment Variables

The `.env` file has been created with your Clerk keys:
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key (for backend use)

## What's Been Updated

### 1. **Clerk Authentication Integration**
- Replaced custom Sign In/Sign Up pages with Clerk's pre-built components
- Added ClerkProvider wrapper in `main.tsx`
- Integrated UserButton in the Navbar for signed-in users
- Sign In/Sign Up routes now use Clerk's components

### 2. **Clean UI/UX**
- **Header**: Fixed and clean with Astra logo on the left
- **Removed**: Cart icon from top right
- **Added**: User authentication button (Sign In or User Profile)
- **Store Header**: Separate, sticky header below main nav with category title, item count, currency toggle, and filter button

### 3. **Product Cards - Original Design**
- Restored the original product card design from your screenshots
- Logo at top center
- "ASTRA STORE" title
- Product image with hover scale effect
- Price overlay with dynamic text color based on background
- Yellow bottom bar with description and "BUY NOW" button
- Out of stock overlay when applicable

### 4. **URL Structure**
- Changed from `/store?category=astra` to `/store/category/astra`
- Product details: `/store/category/{category}/{product-slug}`
- Category selection: `/store` (shows iOS-style category list)

### 5. **Filter Functionality**
- Filter modal with category chips (from database)
- Price range slider (works with USD/INR)
- Clear and Apply buttons
- Mobile-responsive bottom sheet design

### 6. **Navigation**
- Astra logo always visible on the left
- Search icon (when applicable)
- User authentication (Sign In button or User profile)
- Menu hamburger icon

## Running the App

```bash
npm run dev
```

The app will start on `http://localhost:3000`

## Features

- ✅ Clerk authentication (Sign In/Sign Up)
- ✅ Clean, fixed header with logo
- ✅ Original product card design
- ✅ Category-based URL routing
- ✅ Filter by category and price
- ✅ USD/INR currency toggle
- ✅ Responsive design
- ✅ Product detail modal
- ✅ Admin panel with INR price input

## Next Steps

1. Run `npm install` to install Clerk
2. Start the dev server with `npm run dev`
3. Test authentication by clicking "Sign In"
4. Browse products and test filters

## Notes

- The Clerk components will handle all authentication UI
- User sessions are managed automatically by Clerk
- You can customize Clerk's appearance in your Clerk Dashboard
- The admin panel still uses the original authentication (you may want to protect it with Clerk later)
