# Translation Implementation Guide

## Status

The application has been set up for internationalization (i18n) using `react-i18next`. 

### Completed
- ✅ i18n infrastructure installed and configured
- ✅ Translation files created for: English (en), Spanish (es), French (fr), German (de), Portuguese (pt), Italian (it)
- ✅ Components partially updated to use translations
- ✅ Language detection from browser settings

### In Progress
- ⚠️ Updating all components to use translation keys
- ⚠️ Adding translations for remaining languages

## Translation Files Location

All translation files are located in `src/i18n/locales/`.

Current translation files:
- `en.json` - English (complete)
- `es.json` - Spanish (complete)
- `fr.json` - French (complete)
- `de.json` - German (complete)
- `pt.json` - Portuguese (complete)
- `it.json` - Italian (complete)
- Additional language files created as placeholders

## Adding More Languages

To add translations for additional languages:

1. Copy `en.json` to a new file (e.g., `nl.json` for Dutch)
2. Translate all the values (keep the keys the same)
3. Import and add to `src/i18n/config.js` in the `resources` object

## Translation Keys Structure

```
app.title
app.footer.poweredBy
app.footer.githubRepo
tabs.lookup
tabs.search
tabs.browse
searchForm.*
bibleSelector.*
passageDisplay.*
searchResults.*
browse.*
errors.*
loading.*
cookieConsent.*
```

## Notes

- The app will automatically detect the user's browser language
- Falls back to English if a translation is missing
- Language preference is stored in localStorage
- More language translations can be added incrementally

