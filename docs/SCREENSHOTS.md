# Screenshots Guide

This document provides guidance on what screenshots to capture for the Bible Study Tool.

## Required Screenshots

### 1. Main Interface (Home Page)
**File:** `main-interface.png`
**Description:** Show the main search interface with all three tabs visible
- File location: `docs/screenshots/main-interface.png`
- What to capture:
  - The three tabs: "Lookup Reference", "Keyword Search", "Browse"
  - Bible selector dropdown
  - Clean, modern interface

### 2. Lookup Reference Tab
**File:** `lookup-reference.png`
**Description:** Show the reference lookup functionality
- File location: `docs/screenshots/lookup-reference.png`
- What to capture:
  - "Lookup Reference" tab active
  - Example reference entered (e.g., "John 3:16")
  - Bible versions selected
  - Lookup button visible

### 3. Search Results
**File:** `search-results.png`
**Description:** Show search results with highlighted terms
- File location: `docs/screenshots/search-results.png`
- What to capture:
  - "Keyword Search" tab with results displayed
  - Highlighted search terms
  - Multiple passages shown
  - Search metadata (result count)

### 4. Parallel Bible View
**File:** `parallel-view.png`
**Description:** Show multiple Bible versions side-by-side
- File location: `docs/screenshots/parallel-view.png`
- What to capture:
  - Two or more Bible versions displayed in parallel
  - Version labels showing which is which
  - Same passage from different translations

### 5. Browse Tab
**File:** `browse-tab.png`
**Description:** Show the Bible browsing interface
- File location: `docs/screenshots/browse-tab.png`
- What to capture:
  - "Browse" tab active
  - Book selector with Old/New Testament groups
  - Chapter selector
  - Navigation buttons (Previous/Next)
  - A chapter displayed (e.g., "John 1")

### 6. Responsive Design (Mobile)
**File:** `mobile-view.png`
**Description:** Show the mobile-responsive design
- File location: `docs/screenshots/mobile-view.png`
- What to capture:
  - Interface on mobile/small screen
  - Tabs still accessible
  - Content properly formatted

### 7. Language Selection (Optional)
**File:** `internationalization.png`
**Description:** Show the interface in a different language
- File location: `docs/screenshots/internationalization.png`
- What to capture:
  - Interface in Spanish, French, or another non-English language
  - All text translated
  - Shows i18n capability

## Screenshot Guidelines

### Image Specifications
- **Format:** PNG (preferred) or JPG
- **Resolution:** 
  - Desktop: 1920x1080 or 1440x900
  - Mobile: 375x667 (iPhone) or 360x640 (Android)
- **File Size:** Keep under 500KB per image (optimize if needed)
- **Naming:** Use kebab-case (lowercase with hyphens)

### Taking Screenshots
1. Use browser developer tools to set specific viewport sizes
2. Ensure the interface looks clean and professional
3. Remove any sensitive data (passwords, API keys, etc.)
4. Use a clean browser window (minimize extensions/plugins visible)
5. Consider using browser extensions like:
   - Awesome Screenshot
   - Nimbus Screenshot
   - Browser's built-in screenshot tools

### Browser Recommendations
- Chrome or Firefox (latest version)
- Use dark mode or light mode consistently
- Ensure good contrast for readability

## Image Optimization

After taking screenshots, optimize them for web:

```bash
# Using ImageMagick (if installed)
mogrify -quality 85 -strip docs/screenshots/*.png

# Or use online tools like TinyPNG
```

## Adding Screenshots to README

Once screenshots are placed in `docs/screenshots/`, they will automatically appear in the README. The README uses relative paths, so screenshots will work on GitHub.

