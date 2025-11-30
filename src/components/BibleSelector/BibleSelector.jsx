import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getBibles } from '../../services/api'
import { formatBibleName } from '../../utils/formatters'
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
    const optgroups = buildOptgroups(bibles)

    // Initialize tom-select
    tomSelectInstance.current = new TomSelect(selectRef.current, {
      plugins: ['remove_button'],
      maxOptions: null,
      maxItems: allowMultiple ? null : 1,
      placeholder: allowMultiple ? t('bibleSelector.placeholderMultiple') : t('bibleSelector.placeholder'),
      closeAfterSelect: false,
      allowEmptyOption: true,
      options: options,
      optgroups: optgroups,
      labelField: 'text',
      valueField: 'value',
      searchField: ['text', 'lang'],
      optgroupField: 'optgroup',
      optgroupLabelField: 'label',
      optgroupValueField: 'value',
      lockOptgroupOrder: true,
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

  // Build optgroups array
  const buildOptgroups = (biblesList) => {
    const languages = new Set()
    
    biblesList.forEach(bible => {
      const lang = bible.lang || bible.lang_short || 'Other'
      languages.add(lang)
    })

    return Array.from(languages).sort().map(lang => ({
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
