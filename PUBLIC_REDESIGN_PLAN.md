# 🔴 Public Pages Redesign - "The Red Wire" News Theme

**Date:** 2026-01-24  
**Inspiration:** BBC News, CNN, Bloomberg, The Guardian  
**Aesthetic:** Professional Broadcast • Red Wire • Paper & Ink

---

## 🎨 **COLOR PALETTE - "The Red Wire"**

### **Primary Colors:**
```css
/* The Red Wire - Breaking News & CTAs */
--news-red-700: #B90000;      /* Primary red - Breaking banners */
--news-red-600: #D32F2F;      /* Accent red - Links, active states */
--news-red-500: #E53935;      /* Hover red */

/* Paper & Ink - Base */
--news-white: #FFFFFF;        /* Pure white backgrounds */
--news-offwhite: #F9FAFB;     /* Secondary backgrounds */
--news-black: #111111;        /* Headline text */
--news-darkgray: #333333;     /* Body text */

/* The Grid - Borders & Separators */
--news-gray-200: #E5E7EB;     /* 1px borders */
--news-gray-300: #D1D5DB;     /* Strong separators */
--news-gray-400: #9CA3AF;     /* Muted elements */
--news-gray-600: #4B5563;     /* Secondary text */
```

### **Status Colors:**
```css
--news-live: #B90000;         /* LIVE badge */
--news-breaking: #D32F2F;     /* BREAKING badge */
--news-trending: #F97316;     /* Trending badge */
```

---

## 📐 **LAYOUT SYSTEM - "The Grid"**

### **12-Column Newspaper Grid:**
- Desktop: 12 columns with `border-r border-gray-200`
- Tablet: 8 columns
- Mobile: 4 columns

### **Spacing:**
- Section gaps: `gap-0` (use borders instead)
- Article padding: `p-4` (dense, professional)
- Line separators: `divide-y divide-gray-200`

---

## 📰 **PAGES TO REDESIGN:**

### **1. Homepage** (`src/app/(public)/page.tsx`)

**Hero Section:**
```
┌─────────────────────────────────────────────────┐
│ ┌──────────────────┐ ┌─────────────────────┐   │
│ │                  │ │ 1. Secondary Story  │   │
│ │   HERO IMAGE     │ ├─────────────────────┤   │
│ │   (8 cols)       │ │ 2. Secondary Story  │   │
│ │                  │ ├─────────────────────┤   │
│ └──────────────────┘ │ 3. Secondary Story  │   │
│ MAIN HEADLINE        ├─────────────────────┤   │
│ Summary...           │ 4. Secondary Story  │   │
│                      ├─────────────────────┤   │
│                      │ 5. Secondary Story  │   │
│                      └─────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Breaking News Banner:**
- Sticky top: `bg-red-700 text-white`
- Full width, uppercase, bold
- "BREAKING" badge + scrolling headline

**Latest News Grid:**
- 3-column grid (desktop)
- Each card: Image + Headline + Timestamp
- `border-r border-b border-gray-200`

**News Reels Rail:**
- Horizontal scroll (like Instagram Stories)
- Aspect ratio: `aspect-[9/16]`
- Thumbnails with "REEL" badge

---

### **2. Article Reader** (`src/app/(public)/articles/[slug]/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Category │ LIVE • 2 MIN AGO                     │
├─────────────────────────────────────────────────┤
│           MAIN HEADLINE                         │
│           (Serif font, 48px)                    │
├─────────────────────────────────────────────────┤
│ By Author Name | Published Date                 │
├─────────────────────────────────────────────────┤
│                                                 │
│           [Hero Image - Full Width]             │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   Article content in serif font,               │
│   max-width 720px, centered                    │
│   Line height: 1.8                             │
│   Font size: 18px                              │
│                                                 │
│   Readable, professional typography            │
│                                                 │
├─────────────────────────────────────────────────┤
│   RELATED ARTICLES (sidebar or bottom)         │
│   3-4 cards with thumbnails                    │
└─────────────────────────────────────────────────┘
```

**Features:**
- Share buttons (Facebook, Twitter, WhatsApp)
- Read time estimate ("5 min read")
- Author bio box
- Comments section (optional)
- "More from this category" section

---

### **3. Category Pages** (`src/app/(public)/categories/[slug]/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│           CATEGORY NAME                         │
│           (Red underline)                       │
├─────────────────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│ │ IMG  │  │ IMG  │  │ IMG  │  │ IMG  │         │
│ ├──────┤  ├──────┤  ├──────┤  ├──────┤         │
│ │Title │  │Title │  │Title │  │Title │         │
│ │Time  │  │Time  │  │Time  │  │Time  │         │
│ └──────┘  └──────┘  └──────┘  └──────┘         │
├─────────────────────────────────────────────────┤
│ [Load More Articles]                            │
└─────────────────────────────────────────────────┘
```

**Grid:** 4 columns (desktop), 2 (tablet), 1 (mobile)

---

### **4. News Reels Viewer** (`src/app/(public)/reels/[id]/page.tsx`)

**Full-Screen Vertical Player:**
```
┌─────────────────┐
│                 │
│      VIDEO      │
│   (9:16 ratio)  │
│                 │
│                 │
│                 │
│   ↑ Prev Reel   │
│                 │
│   ↓ Next Reel   │
│                 │
│─────────────────│
│ Headline Text   │
│ [Read Article]  │
└─────────────────┘
```

**Features:**
- Arrow key navigation (↑↓)
- Swipe gestures on mobile
- Auto-play with mute toggle
- Progress bar at top
- "Read Full Article" CTA button

---

## 🎨 **TYPOGRAPHY:**

### **Fonts to Import:**
```tsx
import { Playfair_Display, Work_Sans } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif'
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans'
});
```

### **Usage:**
- **Headlines:** `font-serif` (Playfair Display)
- **Body text:** `font-serif` for article content
- **UI elements:** `font-sans` (Work Sans)
- **Timestamps:** `font-sans uppercase text-xs font-bold`

---

## 🔧 **COMPONENTS TO CREATE:**

### **1. BreakingBanner.tsx**
- Sticky red banner at top
- "BREAKING" badge + scrolling headline
- Close button

### **2. HeroSection.tsx**
- 8-col main story + 4-col secondary stories
- Large image + serif headline

### **3. ArticleCard.tsx**
- Image thumbnail
- Category badge
- Headline (serif)
- Timestamp (ALL CAPS, red)
- `border-r border-b border-gray-200`

### **4. ReelsRail.tsx**
- Horizontal scroll container
- 9:16 aspect ratio thumbnails
- "REEL" badge overlay

### **5. ReelsPlayer.tsx**
- Full-screen modal
- Vertical video player
- Arrow key navigation
- Headline overlay at bottom

### **6. ArticleReader.tsx**
- Max-width 720px content
- Serif typography
- Image galleries
- Related articles sidebar

---

## 🎯 **DESIGN PRINCIPLES:**

### **"The Squint Test"**
When you squint:
- **Big headline = Big font** (clear hierarchy)
- Red elements pop (urgent/active)
- Grid structure visible (borders define sections)

### **"The Red Wire" Rules:**
✅ **Use Red for:**
- LIVE/BREAKING badges
- Active states
- Links (on hover)
- CTAs (Read More, Subscribe)

❌ **Never Red for:**
- Backgrounds (except Breaking banner)
- Body text
- Large areas

### **"Paper & Ink" Rules:**
- White/Off-white backgrounds **only**
- Black/Dark gray text **only**
- No blues, no purples, no "SaaS colors"

### **"The Grid" Rules:**
- 1px borders (`border-gray-200`)
- No drop shadows
- No rounded corners (except `rounded-sm` max)
- No gradients (except black video overlay)

---

## 📱 **RESPONSIVE BEHAVIOR:**

### **Desktop (1280px+):**
- 12-column grid
- Sidebar navigation visible
- Hero: 8 cols + 4 cols

### **Tablet (768px - 1279px):**
- 8-column grid
- Collapsible sidebar
- Hero: 6 cols + 6 cols stacked

### **Mobile (<768px):**
- 4-column grid (effectively single column)
- Full-width cards
- Hamburger menu
- Sticky breaking banner

---

## ✅ **QUALITY CHECKLIST:**

Before deploying, verify:

1. ✅ **Squint Test:** Hierarchy clear at a glance
2. ✅ **Mobile Reel Check:** iPhone safe-area-inset-bottom
3. ✅ **Type Check:** Serif for headlines, Sans for UI
4. ✅ **Pixel Check:** All borders 1px solid gray-200
5. ✅ **Red Check:** Red only for urgent/active elements
6. ✅ **Grid Check:** Everything aligns to 12-col grid
7. ✅ **Image Check:** No filters, `object-cover` always

---

## 🚀 **IMPLEMENTATION ORDER:**

1. ✅ Update `globals.css` with new color palette
2. ✅ Import Google Fonts (Playfair + Work Sans)
3. ✅ Create base components (ArticleCard, ReelsRail)
4. ✅ Redesign Homepage
5. ✅ Redesign Article Reader
6. ✅ Create Reels Player
7. ✅ Redesign Category Pages
8. ✅ Test responsive behavior

---

## 🎨 **INSPIRATION REFERENCES:**

- **BBC News:** Red accent, serif headlines, strict grid
- **CNN:** Breaking banner, live badges, dense layout
- **Bloomberg:** High-density data, professional aesthetic
- **The Guardian:** Clean typography, excellent readability
- **Sky News:** Video integration, modern news design

---

**This redesign will transform your news portal into a professional broadcast-quality platform that rivals BBC and CNN!** 🔴📰

Ready to implement?
