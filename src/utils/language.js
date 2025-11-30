/**
 * Utility functions for language detection and default Bible selection
 */

/**
 * Get the user's browser language
 * @returns {string} Language code (e.g., 'en', 'fr', 'es')
 */
export const getUserLanguage = () => {
  if (typeof navigator === 'undefined') {
    return 'en' // Default to English
  }

  // Get primary language (e.g., 'en-US' -> 'en')
  const lang = navigator.language || navigator.userLanguage || 'en'
  return lang.split('-')[0].toLowerCase()
}

/**
 * Get default Bible module based on user's language
 * @param {object} availableBibles - Map of available Bible modules
 * @returns {string|null} Default Bible module code or null if not available
 */
export const getDefaultBibleModule = (availableBibles = {}) => {
  const userLang = getUserLanguage()
  const availableModules = Object.keys(availableBibles)

  // Language-based defaults
  const languageDefaults = {
    'en': 'kjv',  // English -> King James Version
    'fr': 'oster', // French -> Oster
  }

  const defaultModule = languageDefaults[userLang]

  // Verify the module exists in available Bibles
  if (defaultModule && availableModules.includes(defaultModule)) {
    return defaultModule
  }

  // Fallback: if English, try to find any English Bible
  if (userLang === 'en' && availableModules.length > 0) {
    // Prefer kjv, otherwise take first available
    return availableModules.includes('kjv') ? 'kjv' : availableModules[0]
  }

  // Fallback: if French, try to find any French Bible
  if (userLang === 'fr' && availableModules.length > 0) {
    // Prefer oster, otherwise try to find a French one
    if (availableModules.includes('oster')) {
      return 'oster'
    }
    // Could add logic to find French Bibles by checking language property
  }

  // Ultimate fallback: return first available Bible or null
  return availableModules.length > 0 ? availableModules[0] : null
}

/**
 * Get default Bible modules as array for multi-select
 * @param {object} availableBibles - Map of available Bible modules
 * @returns {string[]} Array of default Bible module codes
 */
export const getDefaultBibleModules = (availableBibles = {}) => {
  const defaultModule = getDefaultBibleModule(availableBibles)
  return defaultModule ? [defaultModule] : []
}

export default {
  getUserLanguage,
  getDefaultBibleModule,
  getDefaultBibleModules,
}

