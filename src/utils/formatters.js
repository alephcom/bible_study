/**
 * Utility functions for formatting Bible data
 */

/**
 * Format a verse number for display
 * @param {number|string} verse - Verse number
 * @returns {string} Formatted verse number
 */
export const formatVerseNumber = (verse) => {
  return String(verse || '')
}

/**
 * Format a passage reference for display
 * @param {object} passage - Passage object with book, chapter, verse info
 * @returns {string} Formatted reference
 */
export const formatPassageReference = (passage) => {
  if (!passage) return ''
  
  const book = passage.book || passage.book_name || ''
  const chapter = passage.chapter || ''
  const verse = passage.verse || ''
  const verseEnd = passage.verse_end || ''

  if (!book || !chapter || !verse) {
    return ''
  }

  let ref = `${book} ${chapter}:${verse}`
  
  if (verseEnd && verseEnd !== verse) {
    ref += `-${verseEnd}`
  }

  return ref
}

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string|array} searchTerms - Term(s) to highlight
 * @param {string} tag - HTML tag to wrap highlights (default: 'mark')
 * @returns {string} HTML with highlighted terms
 */
export const highlightSearchTerms = (text, searchTerms, tag = 'mark') => {
  if (!text || !searchTerms) {
    return text || ''
  }

  const terms = Array.isArray(searchTerms) 
    ? searchTerms 
    : [searchTerms].filter(Boolean)

  if (terms.length === 0) {
    return text
  }

  // Escape special regex characters and create pattern
  const escapedTerms = terms.map(term => 
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')

  // Split text and wrap matches
  const parts = text.split(pattern)
  
  return parts.map((part, index) => {
    const isMatch = terms.some(term => 
      part.toLowerCase() === term.toLowerCase()
    )
    
    if (isMatch) {
      return `<${tag} class="search-highlight">${part}</${tag}>`
    }
    return part
  }).join('')
}

/**
 * Clean HTML tags from text (for plain text display)
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export const stripHtml = (html) => {
  if (!html) return ''
  
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

/**
 * Format Bible name for display
 * @param {object} bible - Bible object
 * @returns {string} Formatted name
 */
export const formatBibleName = (bible) => {
  if (!bible) return ''
  
  return bible.name || bible.shortname || bible.module || ''
}

export default {
  formatVerseNumber,
  formatPassageReference,
  highlightSearchTerms,
  stripHtml,
  formatBibleName,
}

