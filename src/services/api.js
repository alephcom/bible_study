import axios from 'axios'

// API base URL - should be the full path to the API root
// Examples: 'http://localhost/api' or 'https://your-domain.com/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api'

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Handle API errors and format them for the UI
 */
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    return {
      message: data?.errors?.[0] || data?.message || `API Error: ${status}`,
      status,
      errors: data?.errors || [],
      errorLevel: data?.error_level || 0,
    }
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Unable to connect to the API. Please check your connection.',
      status: 0,
      errors: [],
    }
  } else {
    // Error in request setup
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      errors: [],
    }
  }
}

/**
 * Generic API action handler
 * @param {string} action - API action name (query, bibles, books, etc.)
 * @param {object} params - Parameters to send to the API
 * @returns {Promise} API response
 */
const apiAction = async (action = 'query', params = {}) => {
  try {
    // Convert array parameters to comma-separated strings if needed
    const processedParams = { ...params }
    if (processedParams.bible && Array.isArray(processedParams.bible)) {
      // API accepts bible as array in query string
      processedParams.bible = processedParams.bible
    }

    // Use default API endpoint (v2 routes exist but versioning is not yet implemented,
    // both /api/{action} and /api/v2/{action} point to the same controller)
    const endpoint = `/${action}`
    
    const response = await apiClient.get(endpoint, {
      params: processedParams,
    })

    return {
      success: true,
      data: response.data,
      metadata: response.data,
      results: response.data.results,
      errors: response.data.errors || [],
      errorLevel: response.data.error_level || 0,
    }
  } catch (error) {
    const errorInfo = handleApiError(error)
    return {
      success: false,
      error: errorInfo,
      data: null,
    }
  }
}

/**
 * Query action - Main search and passage lookup
 * @param {object} options - Query options
 * @param {string} options.reference - Bible reference (e.g., "John 3:16")
 * @param {string} options.search - Search keywords
 * @param {string|array} options.bible - Bible version(s) to search
 * @param {string} options.data_format - Format of results (default: 'passage')
 * @param {boolean} options.highlight - Whether to highlight search terms
 * @param {boolean} options.context - Whether to include context
 * @param {number} options.context_range - Number of verses for context
 * @param {number} options.page - Page number for pagination
 * @param {number} options.page_limit - Results per page
 * @param {string} options.search_type - Search type (and, or, phrase, etc.)
 * @returns {Promise} Query results
 */
export const query = async (options = {}) => {
  return apiAction('query', options)
}

/**
 * Get list of available Bible versions
 * @param {object} options - Options for Bible list
 * @param {boolean} options.order_by_lang_name - Order by language name
 * @param {string} options.language_float - Language to float to top
 * @returns {Promise} List of Bibles
 */
export const getBibles = async (options = {}) => {
  const defaultOptions = {
    order_by_lang_name: true,
    ...options,
  }
  const result = await apiAction('bibles', defaultOptions)
  
  // Transform the Bible object into an array for easier use
  if (result.success && result.results) {
    result.biblesArray = Object.keys(result.results).map(module => ({
      module,
      ...result.results[module],
    }))
  }
  
  return result
}

/**
 * Get list of Bible books
 * @param {object} options - Options for books list
 * @param {string} options.language - Language code
 * @returns {Promise} List of books
 */
export const getBooks = async (options = {}) => {
  return apiAction('books', options)
}

/**
 * Get Strong's number definitions
 * @param {object} options - Options for Strong's lookup
 * @returns {Promise} Strong's definitions
 */
export const getStrongs = async (options = {}) => {
  return apiAction('strongs', options)
}

/**
 * Get API version information
 * @returns {Promise} Version info
 */
export const getVersion = async () => {
  return apiAction('version', {})
}

/**
 * Search for Bible passages by keyword
 * @param {string} searchTerm - Search keywords
 * @param {string|array} bible - Bible version(s)
 * @param {object} additionalOptions - Additional search options
 * @returns {Promise} Search results
 */
export const search = async (searchTerm, bible, additionalOptions = {}) => {
  return query({
    search: searchTerm,
    bible: bible,
    ...additionalOptions,
  })
}

/**
 * Look up a Bible passage by reference
 * @param {string} reference - Bible reference (e.g., "John 3:16")
 * @param {string|array} bible - Bible version(s)
 * @param {object} additionalOptions - Additional options
 * @returns {Promise} Passage results
 */
export const lookupPassage = async (reference, bible, additionalOptions = {}) => {
  return query({
    reference: reference,
    bible: bible,
    data_format: 'passage',
    ...additionalOptions,
  })
}

export default {
  query,
  getBibles,
  getBooks,
  getStrongs,
  getVersion,
  search,
  lookupPassage,
  apiAction,
}

