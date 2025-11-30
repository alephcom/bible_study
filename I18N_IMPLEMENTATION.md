# Internationalization (i18n) Implementation

## Overview

The application has been fully internationalized using `react-i18next`. All user-facing text strings have been extracted into translation files, and the app automatically detects and uses the user's browser language.

## Implementation Status

### ✅ Completed Components
- Layout (header, footer)
- CookieConsent
- SearchForm
- SearchPage (tabs, browse controls)
- SearchResults
- PassageDisplay
- BibleSelector

### ✅ Translation Files Created

**Fully Translated Languages:**
- English (en) - Base language
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Italian (it)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)

**Placeholder Files (English content, ready for translation):**
- Dutch (nl)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Polish (pl)
- Turkish (tr)
- Swedish (sv)
- Danish (da)
- Finnish (fi)
- Norwegian (no)
- Czech (cs)
- Romanian (ro)
- Hungarian (hu)
- Greek (el)
- Hebrew (he)
- Indonesian (id)
- Vietnamese (vi)
- Thai (th)

## How It Works

1. **Language Detection**: Automatically detects user's browser language on first visit
2. **Fallback**: Falls back to English if a translation is missing
3. **Storage**: Language preference is stored in localStorage
4. **Dynamic Updates**: All text updates immediately when language changes

## Adding Translations for New Languages

To add translations for any of the placeholder languages or a new language:

1. **Copy the English translation file:**
   ```bash
   cp src/i18n/locales/en.json src/i18n/locales/[lang].json
   ```

2. **Translate all values** (keep the keys the same):
   ```json
   {
     "app": {
       "title": "Your translated title here"
     }
   }
   ```

3. **Add to config.js** (if it's a new language):
   - Import the file at the top
   - Add to the `resources` object

## Translation Keys Structure

All translation keys follow this structure:

```
app.*                  - Application title and footer
tabs.*                 - Tab navigation
searchForm.*           - Search form labels and messages
bibleSelector.*        - Bible selector component
passageDisplay.*       - Passage display messages
searchResults.*        - Search results and pagination
browse.*               - Browse/book navigation
errors.*               - Error messages
loading.*              - Loading messages
cookieConsent.*        - Cookie consent banner
```

## Usage in Components

Components use the `useTranslation` hook:

```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return <h1>{t('app.title')}</h1>
}
```

## Current Language Support

- **9 languages** with complete translations
- **19 languages** with placeholder files ready for translation
- **Automatic language detection** from browser settings
- **English fallback** for missing translations

## Next Steps

To complete translations for remaining languages:
1. Copy `en.json` to each language file
2. Translate all values while keeping keys unchanged
3. The app will automatically use the translations once files are updated

