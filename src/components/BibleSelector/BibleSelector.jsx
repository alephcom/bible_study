import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getBibles } from '../../services/api'
import { formatBibleName } from '../../utils/formatters'
import { getUserLanguage } from '../../utils/language'
import TomSelect from 'tom-select'
import 'tom-select/dist/css/tom-select.css'
import './BibleSelector.css'

function BibleSelector({ selectedBibles = [], onSelectionChange, allowMultiple = true }) {
  const { t } = useTranslation()
  const [bibles, setBibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const selectRef = useRef(null)
  const tomSelectInstance = useRef(null)

  useEffect(() => {
    loadBibles()
  }, [])

  useEffect(() => {
    if (bibles.length === 0 || loading || !selectRef.current) return

    // Destroy existing instance if it exists
    if (tomSelectInstance.current) {
      tomSelectInstance.current.destroy()
      tomSelectInstance.current = null
    }

    // Build options and optgroups for tom-select
    const options = buildTomSelectOptions(bibles)
    const userLang = getUserLanguage()
    
    // Sort optgroups to prioritize user's language first
    const optgroups = buildOptgroups(bibles, userLang)
    
    // Find which language group matches the user's language (using the same logic as buildOptgroups)
    const langNameMap = {
      'en': ['english', 'anglais', 'en', 'eng'],
      'fr': ['french', 'français', 'francais', 'fr', 'fra'],
      'es': ['spanish', 'español', 'espagnol', 'es', 'spa'],
      'de': ['german', 'allemand', 'deutsch', 'de', 'ger'],
      'pt': ['portuguese', 'portugais', 'português', 'pt', 'por'],
      'it': ['italian', 'italien', 'italiano', 'it', 'ita'],
      'ru': ['russian', 'russe', 'ruso', 'ru', 'rus'],
      'zh': ['chinese', 'chinois', 'chino', 'zh', 'chi'],
      'ja': ['japanese', 'japonais', 'japonés', 'ja', 'jpn'],
      'ko': ['korean', 'coréen', 'coreano', 'ko', 'kor'],
    }
    const userLangNames = userLang ? (langNameMap[userLang] || [userLang]) : []
    
    // Find the user's language group from the optgroups
    const userLangGroup = optgroups.find(optgroup => {
      const langLower = optgroup.label?.toLowerCase().trim() || ''
      return userLangNames.some(name => {
        const nameLower = name.toLowerCase().trim()
        return langLower === nameLower || 
               langLower.startsWith(nameLower) ||
               new RegExp(`\\b${nameLower}\\b`, 'i').test(langLower)
      })
    })
    
    // Sort options to prioritize user's language Bibles first
    const sortedOptions = [...options].sort((a, b) => {
      const aLang = a.lang?.toLowerCase()?.trim() || ''
      const bLang = b.lang?.toLowerCase()?.trim() || ''
      const userLangGroupName = userLangGroup?.label?.toLowerCase().trim() || ''
      
      // Check if language matches user's language group
      const aMatches = userLangGroupName && aLang === userLangGroupName
      const bMatches = userLangGroupName && bLang === userLangGroupName
      
      // User's language first
      if (aMatches && !bMatches) return -1
      if (!aMatches && bMatches) return 1
      
      // Same language group - maintain original order
      return 0
    })
    
    // Initialize tom-select with enhanced search and filtering
    tomSelectInstance.current = new TomSelect(selectRef.current, {
      plugins: ['remove_button'],
      maxOptions: null,
      maxItems: allowMultiple ? null : 1,
      placeholder: allowMultiple ? t('bibleSelector.placeholderMultiple') : t('bibleSelector.placeholder'),
      closeAfterSelect: false,
      allowEmptyOption: true,
      options: sortedOptions,
      optgroups: optgroups,
      labelField: 'text',
      valueField: 'value',
      searchField: ['text', 'lang'], // Enable search by Bible name and language
      optgroupField: 'optgroup',
      optgroupLabelField: 'label',
      optgroupValueField: 'value',
      lockOptgroupOrder: true, // Lock order to respect our sorted optgroups (user's language first)
      create: false,
      // Make search more prominent - allow typing directly in control
      openOnFocus: true,
      dropdownParent: 'body', // Ensure dropdown appears above other content
      onChange: (values) => {
        onSelectionChange(values || [])
      },
    })

    // Set initial values
    if (selectedBibles.length > 0) {
      tomSelectInstance.current.setValue(selectedBibles, true)
    }

    // Cleanup on unmount
    return () => {
      if (tomSelectInstance.current) {
        tomSelectInstance.current.destroy()
        tomSelectInstance.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bibles, loading, allowMultiple])

  // Sync selected values when prop changes
  useEffect(() => {
    if (tomSelectInstance.current && selectedBibles) {
      const currentValues = tomSelectInstance.current.getValue()
      const valuesChanged = 
        currentValues.length !== selectedBibles.length ||
        !currentValues.every(val => selectedBibles.includes(val))

      if (valuesChanged) {
        tomSelectInstance.current.setValue(selectedBibles, true)
      }
    }
  }, [selectedBibles])

  const loadBibles = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getBibles({ order_by_lang_name: true })
      
      if (result.success && result.biblesArray) {
        setBibles(result.biblesArray)
      } else {
        setError(result.error?.message || 'Failed to load Bible versions')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading Bibles')
    } finally {
      setLoading(false)
    }
  }

  // Build options array for tom-select
  const buildTomSelectOptions = (biblesList) => {
    const options = []
    const languages = {}

    biblesList.forEach(bible => {
      const lang = bible.lang || bible.lang_short || 'Other'
      
      // Create optgroup if it doesn't exist
      if (!languages[lang]) {
        languages[lang] = {
          value: lang,
          label: lang,
        }
      }

      options.push({
        value: bible.module,
        text: formatBibleName(bible) + (bible.shortname && bible.shortname !== bible.name ? ` (${bible.shortname})` : ''),
        optgroup: lang,
        lang: lang,
      })
    })

    return options
  }

  // Build optgroups array, prioritizing user's language
  const buildOptgroups = (biblesList, userLang = null) => {
    const languages = new Set()
    
    biblesList.forEach(bible => {
      const lang = bible.lang || bible.lang_short || 'Other'
      languages.add(lang)
    })

    const langArray = Array.from(languages)
    
    // Language name mapping - map language codes to possible language names in the data
    const langNameMap = {
      'en': ['english', 'anglais', 'en', 'eng'],
      'fr': ['french', 'français', 'francais', 'fr', 'fra'],
      'es': ['spanish', 'español', 'espagnol', 'es', 'spa'],
      'de': ['german', 'allemand', 'deutsch', 'de', 'ger'],
      'pt': ['portuguese', 'portugais', 'português', 'pt', 'por'],
      'it': ['italian', 'italien', 'italiano', 'it', 'ita'],
      'ru': ['russian', 'russe', 'ruso', 'ru', 'rus'],
      'zh': ['chinese', 'chinois', 'chino', 'zh', 'chi'],
      'ja': ['japanese', 'japonais', 'japonés', 'ja', 'jpn'],
      'ko': ['korean', 'coréen', 'coreano', 'ko', 'kor'],
    }
    
    // Get possible language names/codes for user's language
    const userLangNames = userLang ? (langNameMap[userLang] || [userLang]) : []
    
    // Find the actual language name from the data that matches user's language
    let userLangMatch = null
    for (const lang of langArray) {
      const langLower = lang.toLowerCase().trim()
      // Check for exact matches first, then substring matches
      const matches = userLangNames.some(name => {
        const nameLower = name.toLowerCase().trim()
        // Exact match
        if (langLower === nameLower) return true
        // Starts with the language name (e.g., "English" matches "English (US)")
        if (langLower.startsWith(nameLower)) return true
        // Contains the language name as a whole word
        const wordBoundary = new RegExp(`\\b${nameLower}\\b`, 'i')
        if (wordBoundary.test(langLower)) return true
        return false
      })
      if (matches) {
        userLangMatch = lang
        break
      }
    }
    
    // Sort languages: user's language FIRST at the top, then others alphabetically
    const sortedLanguages = [...langArray].sort((a, b) => {
      // User's language ALWAYS first (highest priority)
      if (userLangMatch) {
        // If a is user's language, it goes first
        if (a === userLangMatch) return -1
        // If b is user's language, it goes first
        if (b === userLangMatch) return 1
      }
      
      // For all other languages, sort alphabetically
      return a.localeCompare(b)
    })

    return sortedLanguages.map(lang => ({
      value: lang,
      label: lang,
    }))
  }

  if (loading) {
    return (
      <div className="bible-selector loading">
        <div className="loading-spinner-small"></div>
        <p>{t('bibleSelector.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bible-selector error">
        <p>{t('bibleSelector.error')} {error}</p>
        <button onClick={loadBibles}>{t('bibleSelector.retry')}</button>
      </div>
    )
  }

  return (
    <div className="bible-selector">
      <div className="bible-selector-header">
        <label htmlFor="bible-select">
          {allowMultiple ? t('searchForm.selectBiblesMultiple') : t('searchForm.selectBibles')}
        </label>
      </div>

      <select
        ref={selectRef}
        id="bible-select"
        multiple={allowMultiple}
        className="bible-selector-tom-select"
      >
        {/* Options will be added dynamically by tom-select */}
      </select>
    </div>
  )
}

export default BibleSelector
