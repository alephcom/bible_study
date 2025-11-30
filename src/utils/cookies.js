import Cookies from 'js-cookie'

const COOKIE_CONSENT_KEY = 'cookie-consent'
const SELECTED_BIBLES_KEY = 'selected-bibles'
const COOKIE_EXPIRY_DAYS = 365

/**
 * Get cookie consent status
 * @returns {boolean} True if user has consented to cookies
 */
export const hasCookieConsent = () => {
  return Cookies.get(COOKIE_CONSENT_KEY) === 'true'
}

/**
 * Set cookie consent
 * @param {boolean} consented - Whether user consented
 */
export const setCookieConsent = (consented) => {
  Cookies.set(COOKIE_CONSENT_KEY, consented ? 'true' : 'false', {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax',
  })
}

/**
 * Get selected Bibles from cookie
 * @returns {string[]} Array of Bible module names
 */
export const getSelectedBibles = () => {
  if (!hasCookieConsent()) {
    return []
  }

  const stored = Cookies.get(SELECTED_BIBLES_KEY)
  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

/**
 * Save selected Bibles to cookie
 * @param {string[]} bibles - Array of Bible module names
 */
export const saveSelectedBibles = (bibles) => {
  if (!hasCookieConsent()) {
    return
  }

  if (!bibles || !Array.isArray(bibles) || bibles.length === 0) {
    Cookies.remove(SELECTED_BIBLES_KEY)
    return
  }

  Cookies.set(SELECTED_BIBLES_KEY, JSON.stringify(bibles), {
    expires: COOKIE_EXPIRY_DAYS,
    sameSite: 'lax',
  })
}

/**
 * Clear all application cookies
 */
export const clearAllCookies = () => {
  Cookies.remove(COOKIE_CONSENT_KEY)
  Cookies.remove(SELECTED_BIBLES_KEY)
}

export default {
  hasCookieConsent,
  setCookieConsent,
  getSelectedBibles,
  saveSelectedBibles,
  clearAllCookies,
}

