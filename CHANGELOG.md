# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-19

### Added
- **Internationalization (i18n)**: Full translation support for 27 languages
  - Automatic language detection from browser settings
  - Language preference stored in localStorage
  - Complete translations for: English, Spanish, French, German, Portuguese, Italian, Russian, Chinese, Japanese, Korean, Dutch, Arabic, Hindi, Polish, Turkish, Swedish, Danish, Finnish, Norwegian, Czech, Romanian, Hungarian, Greek, Hebrew, Indonesian, Vietnamese, Thai
- **Cookie Consent**: Cookie consent banner for GDPR/privacy compliance
- **Cookie-based Preferences**: Selected Bible versions stored in cookies (with consent)
- **URL State Management**: Current activity (tab, selected Bibles, search terms, passage reference, browse location) stored in URL for bookmarking and sharing
- **Bible Browse Feature**: Full browsing interface with book and chapter navigation
  - Book and chapter selectors grouped by Testament
  - Previous/Next navigation buttons for books and chapters
  - Automatic chapter loading when selections change
- **Language-based Default Bible Selection**: Automatically selects KJV for English users and Oster for French users
- **Three-Tab Interface**: Reorganized UI into separate tabs for:
  - Lookup Reference
  - Keyword Search
  - Browse
- **GitHub Repository Link**: Added link to GitHub repository in footer
- **Bible Version Labels**: Shows which version is which when browsing multiple Bible versions in parallel view
- **Enhanced Search Highlighting**: Improved search term highlighting without spacing issues
- **Modern UI/UX**: Comprehensive redesign with:
  - Reduced whitespace for compact layout
  - Modern gradients and shadows
  - Better dark mode support
  - Improved responsive design
- **Context Options**: Ability to include surrounding verses with configurable range
- **Error Handling**: Comprehensive error messages and loading states
- **Tom-select Integration**: Enhanced Bible selector with search, grouping by language, and multi-select support

### Changed
- Updated API endpoints from `/api/v2/{action}` to `/api/{action}` format
- Improved whitespace throughout the application for better content density
- Reorganized tab structure from two tabs to three separate tabs
- Enhanced passage display with better formatting and parallel view support

### Fixed
- Fixed CORS policy errors documentation
- Fixed highlighting issues where text matches in the middle of words had unwanted spacing
- Fixed passage display when API returns nested verse structures
- Fixed browser compatibility issues

### Technical
- Added `react-i18next` and `i18next-browser-languagedetector` for internationalization
- Integrated React Router with `useSearchParams` for URL state management
- Added cookie utility functions for preference storage
- Enhanced API service layer with better error handling
- Improved component structure and separation of concerns

## [0.1.0] - Initial Release

### Added
- Initial project setup with React and Vite
- Bible reference lookup functionality
- Keyword search functionality
- Multiple Bible version selection
- Parallel Bible version display
- Search term highlighting
- Responsive design

