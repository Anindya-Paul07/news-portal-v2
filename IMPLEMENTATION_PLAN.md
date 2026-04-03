# Implementation Plan - The Red Wire Theme

**Status:** Ready to implement BBC/CNN style news design

## COMPLETED:
1. Added Red Wire color palette to globals.css
2. Google Fonts already imported (Playfair + Work Sans)

## IMPLEMENTATION PHASES:

### Phase 1: Core Components
- BreakingBanner.tsx - Sticky red banner
- ArticleCard.tsx - With red accents
- HeroSection.tsx - 8-col + 4-col layout
- CategoryBadge.tsx - Red/black badges

### Phase 2: Homepage
- Breaking news banner
- Hero section (8+4 columns)
- Latest news grid
- News Reels rail
- Category sections

### Phase 3: Article Reader
- Centered 720px content
- Serif typography
- Hero image
- Share buttons
- Related articles

### Phase 4: News Reels
- ReelsRail.tsx - Horizontal scroll
- ReelsPlayer.tsx - Full-screen vertical
- Arrow navigation
- Headline overlay

### Phase 5: Category Pages
- Category header (red underline)
- 4-column grid
- Pagination

## DESIGN TOKENS:

Colors:
- Red: var(--news-red-700)
- Text: var(--news-black)
- Borders: var(--news-gray-200)

Typography:
- Headlines: Playfair Display (serif)
- Body: Work Sans (sans)

Ready to implement!
