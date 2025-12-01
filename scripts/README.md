# Screenshot Automation Script

This directory contains automated screenshot tools for the Bible Study Tool.

## Automated Screenshot Script

The `take-screenshots.js` script uses Playwright to automatically capture screenshots of the application.

### Prerequisites

1. Playwright is installed (run `npm install` first)
2. Chromium browser is installed (run `npx playwright install chromium`)
3. Development server is running (`npm run dev`)

### Usage

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run the screenshot script:**
   ```bash
   npm run screenshots
   ```

   Or directly:
   ```bash
   node scripts/take-screenshots.js
   ```

3. **Screenshots will be saved to:** `docs/screenshots/`

### Customization

You can customize the base URL:
```bash
BASE_URL=http://localhost:3000 npm run screenshots
```

### What Screenshots Are Taken

The script automatically captures:
- `main-interface.png` - Main interface with all tabs
- `lookup-reference.png` - Reference lookup (John 3:16)
- `search-results.png` - Search results for "love"
- `parallel-view.png` - Parallel Bible view (KJV + NIV)
- `browse-tab.png` - Browse tab (John 1)
- `mobile-view.png` - Mobile responsive view

### Troubleshooting

**Server not running error:**
- Make sure `npm run dev` is running
- Check that the server is accessible at the URL shown

**Screenshots are empty:**
- The API might need to be configured
- Check that BibleSuperSearch API is accessible
- Some screenshots may require API responses to load

**Timeout errors:**
- Increase timeout values in the script
- Check your API response times

