# Store Page Visual Design Guide

## Navigation Bar Design

### Header Structure
```
┌─────────────────────────────────────────────────────────┐
│  🔗 ASTRA Logo    [Search] [Profile] [≡ Menu]          │
└─────────────────────────────────────────────────────────┘
```

### Header Elements:
- **Logo (Left)**: ASTRA logo image - clickable to go home
- **Search Icon**: Only shows on shop/category pages, hidden on landing
- **Profile Icon**: User icon - navigates to profile page
- **Hamburger Menu**: Two horizontal lines (instead of image icon)
- **Background**: Black with white/10 border bottom
- **Spacing**: px-4 (mobile), md:px-8 (desktop)

## Product Grid Layout

### Responsive Columns:
```
Mobile (2 cols)          Tablet (3 cols)       Desktop (4 cols)    XL (5 cols)
┌──────┬──────┐         ┌────┬────┬────┐     ┌───┬───┬───┬───┐   ┌──┬──┬──┬──┬──┐
│ Prod │ Prod │         │Prod│Prod│Prod│     │Prd│Prd│Prd│Prd│   │P │P │P │P │P │
├──────┼──────┤         ├────┼────┼────┤     ├───┼───┼───┼───┤   ├──┼──┼──┼──┼──┤
│ Prod │ Prod │         │Prod│Prod│Prod│     │Prd│Prd│Prd│Prd│   │P │P │P │P │P │
└──────┴──────┘         └────┴────┴────┘     └───┴───┴───┴───┘   └──┴──┴──┴──┴──┘
```

### Gap Spacing:
- Mobile: gap-3 (12px)
- Tablet: sm:gap-4 (16px)
- Desktop: md:gap-5 (20px)
- Large: lg:gap-6 (24px)

## Product Card Design

### Card Structure (3:4 Aspect Ratio)
```
┌──────────────────────┐
│                      │
│   Product Image      │  ◇ (Favorite)
│   + Gradient         │
│                      │
│      Name            │ ⊕ (Add to Cart)
│      Price           │
└──────────────────────┘
```

### Card Colors:
- **Background**: #1c1c1e (dark gray)
- **Border**: white/5 (very subtle)
- **Image**: Full cover with gradient overlay
- **Text**: White for name, gray-300 for price
- **Buttons**: Black/40 backdrop with white border (favorite)
- **Buttons**: White with black icon (add to cart)

### Card Hover Effect:
```
Normal State          →          Hover State
┌──────────────────┐           ╔══════════════════╗
│ No Shadow        │           ║  Lifted Up       ║
│ Scale: 1.0       │  ─────→   ║  Scale: 1.02     ║
│ translateY: 0    │           ║  translateY:-8px ║
│                  │           ║  Shadow: Enhanced║
└──────────────────┘           ╚══════════════════╝
```

### Price Display (INR):
```
₹15,000         (Air Jordan 1)
₹8,500          (Nike Dunk Low)
₹22,000         (Yeezy Boost 350)
₹1,00,000+      (Limited editions)
```
Format: `₹` prefix + comma separator

## Search Feature Visibility

### Landing Page
```
Header: [Logo]  [Search×]  [Signup]  [≡ Menu]
                  ↑
               HIDDEN
```

### Store Page
```
Header: [Logo]  [Search✓]  [Profile]  [≡ Menu]
                  ↑
              VISIBLE
```

### Category Page
```
Header: [Logo]  [Search✓]  [Profile]  [≡ Menu]
                  ↑
              VISIBLE
```

## Filter Panel Layout

### Filter Button Location
```
┌─────────────────────────────────────────────────┐
│ Store Header (sticky top)                       │
│  ASTRA COLLECTION    [$ USD/INR] [⚙ Filters]   │
│  45 items                                       │
└─────────────────────────────────────────────────┘
```

### Filter Modal on Mobile
```
Mobile (Bottom Sheet)        Desktop (Centered Dialog)
┌──────────────────────┐    ┌──────────────────────────┐
│ [×] FILTERS          │    │  FILTERS         [×]     │
│                      │    │                          │
│ Enable Filters  [○]  │    │ Enable Filters   [●]     │
│                      │    │                          │
│ Categories           │    │ Categories               │
│ [Nike] [Jordan]      │    │ [Nike] [Jordan] [Adidas] │
│ [Yeezy] [Adidas]     │    │ [Yeezy] [NB]             │
│                      │    │                          │
│ Price Range          │    │ Price Range              │
│ ₹1,000 ─────────── ₹2L   │ ₹1,000 ──────────── ₹2L  │
│                      │    │                          │
│ [Reset] [Apply]      │    │ [Reset] [Apply]          │
└──────────────────────┘    └──────────────────────────┘
```

## Hamburger Menu Icon

### Design:
```
Default State          Hover State
┌─────────────────┐   ┌─────────────────┐
│ ──────────  ≡   │   │ ──────────  ≡   │
│ ──────────      │   │ ──────────  Hover
│ ──────────      │   │ ──────────
└─────────────────┘   └─────────────────┘
(opacity: 1.0)        (opacity: 0.7)
```

### Code:
```jsx
<button className="flex flex-col gap-1.5">
  <span className="block w-6 h-0.5 bg-white"></span>
  <span className="block w-6 h-0.5 bg-white"></span>
</button>
```

## Color Palette

### Primary Colors:
- **Background**: #000000 (black)
- **Text**: #FFFFFF (white)
- **Accent**: #0071E3 (blue - for scrolled navbar)

### Secondary Colors:
- **Card Background**: #1c1c1e (dark gray)
- **Border Light**: rgba(255, 255, 255, 0.1)
- **Border Subtle**: rgba(255, 255, 255, 0.05)
- **Text Muted**: rgba(255, 255, 255, 0.6)

### Price Display:
- **Symbol**: ₹
- **Color**: #C8A882 (gold accent) or white
- **Format**: Right-aligned on cards

## Animation Timing

### Hover Effects:
- **Duration**: 0.5s
- **Easing**: cubic-bezier(0.16, 1, 0.3, 1)
- **Transform**: translateY(-8px) scale(1.02)
- **Shadow**: 0 20px 40px rgba(0, 0, 0, 0.5)

### Button Interactions:
- **Duration**: 0.4s
- **Easing**: cubic-bezier(0.25, 1, 0.3, 1)
- **Active State**: scale(0.92) opacity(0.8)
- **Hover State**: scale(1.05)

## Typography

### Font Sizes:
- **Heading (Category)**: text-3xl (lg only)
- **Product Name**: text-[15px] (md:text-[16px])
- **Price**: text-[15px] bold (md:text-[16px])
- **Category Tag**: text-xs
- **Item Count**: text-sm text-gray-400

### Font Weights:
- **Headings**: font-bold (700)
- **Product Names**: font-medium (500)
- **Prices**: font-bold (700)
- **Labels**: font-semibold (600)

## Spacing System

### Padding:
- **Container**: px-4 (mobile), sm:px-6, lg:px-8
- **Vertical**: py-6 (header), py-10 (content)
- **Cards**: p-3-6 (varies)

### Gaps:
- **Header Elements**: gap-3 (md:gap-5)
- **Grid**: gap-3, sm:gap-4, md:gap-5, lg:gap-6
- **Stacked Items**: gap-2

## Accessibility Features

- **Aria Labels**: All buttons have descriptive labels
- **Focus States**: outline 2px solid rgba(255, 255, 255, 0.5)
- **Touch Targets**: Minimum 40-44px buttons
- **Color Contrast**: WCAG AA compliant (white on black)
- **Semantic HTML**: Proper button and nav elements

## Responsive Behavior

### Breakpoints Used:
- **sm**: 640px (tablet)
- **md**: 768px (small desktop)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

### Content Width:
- **Max Width**: 1400px (max-w-[1400px])
- **Full Mobile**: No max-width on mobile
- **Centered**: mx-auto on desktop

---

This design provides a premium, modern shopping experience with smooth animations and excellent responsiveness across all devices.
