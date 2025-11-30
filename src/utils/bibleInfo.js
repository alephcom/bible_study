/**
 * Utility functions for Bible version information
 */

/**
 * Format a Bible module code into a readable name
 * @param {string} module - Bible module code (e.g., 'kjv', 'niv')
 * @returns {string} Formatted Bible name
 */
export const formatBibleModule = (module) => {
  if (!module || typeof module !== 'string') {
    return 'Unknown'
  }

  // Common Bible abbreviations mapping
  const abbreviations = {
    'kjv': 'KJV',
    'niv': 'NIV',
    'nkjv': 'NKJV',
    'esv': 'ESV',
    'nasb': 'NASB',
    'nlt': 'NLT',
    'nrsv': 'NRSV',
    'cjb': 'CJB',
    'amp': 'AMP',
    'msg': 'MSG',
    'cev': 'CEV',
    'gnv': 'GNV',
    'asv': 'ASV',
    'ylt': 'YLT',
    'web': 'WEB',
    'wbt': 'WBT',
    'darby': 'Darby',
    'kjv2000': 'KJV2000',
  }

  // Check if we have a known abbreviation
  const lowerModule = module.toLowerCase()
  if (abbreviations[lowerModule]) {
    return abbreviations[lowerModule]
  }

  // Otherwise, format the module name nicely
  return module
    .toUpperCase()
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Get Bible name from Bible object
 * @param {object} bible - Bible object with name, shortname, etc.
 * @returns {string} Formatted Bible name
 */
export const getBibleDisplayName = (bible) => {
  if (!bible) return 'Unknown'
  
  // Prefer shortname if available, otherwise use name or module
  return bible.shortname || bible.name || bible.module || 'Unknown'
}

export default {
  formatBibleModule,
  getBibleDisplayName,
}

