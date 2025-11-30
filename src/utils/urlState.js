/**
 * Utility functions for managing URL state for bookmarking and sharing
 */

/**
 * Encode a value for URL
 * @param {string} value - Value to encode
 * @returns {string} Encoded value
 */
export const encodeUrlValue = (value) => {
  if (!value) return ''
  return encodeURIComponent(String(value))
}

/**
 * Decode a URL value
 * @param {string} value - Encoded value
 * @returns {string} Decoded value
 */
export const decodeUrlValue = (value) => {
  if (!value) return ''
  try {
    return decodeURIComponent(String(value))
  } catch (e) {
    return value
  }
}

/**
 * Get URL state from search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {object} Parsed URL state
 */
export const getUrlState = (searchParams) => {
  return {
    tab: searchParams.get('tab') || null,
    ref: searchParams.get('ref') || null,
    search: searchParams.get('q') || null, // 'q' for query/search terms
    book: searchParams.get('book') || null,
    chapter: searchParams.get('chapter') || null,
    bibles: searchParams.get('bibles') ? searchParams.get('bibles').split(',') : [],
  }
}

/**
 * Build URL search params from state
 * @param {object} state - State object
 * @param {string} state.tab - Active tab ('lookup', 'search', 'browse')
 * @param {string} state.ref - Bible reference
 * @param {string} state.search - Search query
 * @param {string} state.book - Book name (for browse)
 * @param {number} state.chapter - Chapter number (for browse)
 * @param {string[]} state.bibles - Selected Bible versions
 * @returns {URLSearchParams} URL search parameters
 */
export const buildUrlState = ({ tab, ref, search, book, chapter, bibles = [] }) => {
  const params = new URLSearchParams()

  if (tab) {
    params.set('tab', tab)
  }

  if (ref) {
    params.set('ref', encodeUrlValue(ref))
  }

  if (search) {
    params.set('q', encodeUrlValue(search))
  }

  if (book) {
    params.set('book', encodeUrlValue(book))
  }

  if (chapter) {
    params.set('chapter', String(chapter))
  }

  if (bibles && bibles.length > 0) {
    params.set('bibles', bibles.join(','))
  }

  return params
}

/**
 * Update browser URL without reloading
 * @param {URLSearchParams} params - Search parameters
 * @param {string} pathname - Optional pathname (defaults to current)
 */
export const updateUrl = (params, pathname = null) => {
  const newUrl = new URL(window.location.href)
  
  if (pathname) {
    newUrl.pathname = pathname
  }
  
  // Clear existing params and set new ones
  newUrl.search = params.toString()
  
  // Use history API to update URL without reload
  window.history.pushState({}, '', newUrl.toString())
}

export default {
  encodeUrlValue,
  decodeUrlValue,
  getUrlState,
  buildUrlState,
  updateUrl,
}

