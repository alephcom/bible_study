/**
 * Basic Bible reference parser
 * Handles common formats like "John 3:16", "1 John 1:1-3", etc.
 */

/**
 * Parse a Bible reference string into components
 * @param {string} reference - Bible reference string
 * @returns {object|null} Parsed reference or null if invalid
 */
export const parseReference = (reference) => {
  if (!reference || typeof reference !== 'string') {
    return null
  }

  const trimmed = reference.trim()
  if (!trimmed) {
    return null
  }

  // Pattern to match: Book [Chapter]:[Verse][-VerseRange]
  // Examples: "John 3:16", "1 John 1:1-3", "Genesis 1:1"
  const pattern = /^(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?$/
  const match = trimmed.match(pattern)

  if (!match) {
    // Return as-is if we can't parse - let the API handle it
    return {
      original: trimmed,
      book: null,
      chapter: null,
      verse: null,
      verseEnd: null,
    }
  }

  const [, book, chapter, verse, verseEnd] = match

  return {
    original: trimmed,
    book: book.trim(),
    chapter: parseInt(chapter, 10),
    verse: parseInt(verse, 10),
    verseEnd: verseEnd ? parseInt(verseEnd, 10) : null,
  }
}

/**
 * Validate if a reference string looks like a valid Bible reference
 * @param {string} reference - Bible reference string
 * @returns {boolean} True if looks valid
 */
export const isValidReferenceFormat = (reference) => {
  if (!reference || typeof reference !== 'string') {
    return false
  }

  const trimmed = reference.trim()
  if (!trimmed) {
    return false
  }

  // Basic check - has chapter:verse pattern
  return /\d+:\d+/.test(trimmed)
}

/**
 * Format a parsed reference back to string
 * @param {object} parsed - Parsed reference object
 * @returns {string} Formatted reference string
 */
export const formatReference = (parsed) => {
  if (!parsed || !parsed.book || !parsed.chapter || !parsed.verse) {
    return parsed?.original || ''
  }

  let formatted = `${parsed.book} ${parsed.chapter}:${parsed.verse}`
  
  if (parsed.verseEnd && parsed.verseEnd > parsed.verse) {
    formatted += `-${parsed.verseEnd}`
  }

  return formatted
}

export default {
  parseReference,
  isValidReferenceFormat,
  formatReference,
}

