import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import BibleSelector from '../BibleSelector/BibleSelector'
import './SearchForm.css'

function SearchForm({ onSearch, onPassageLookup, selectedBibles, onBibleSelectionChange, loading = false, defaultSearchType = null }) {
  const { t } = useTranslation()
  const [searchType, setSearchType] = useState(defaultSearchType || 'reference') // 'reference' or 'search'
  
  // Update search type when defaultSearchType prop changes
  useEffect(() => {
    if (defaultSearchType) {
      setSearchType(defaultSearchType)
    }
  }, [defaultSearchType])
  const [reference, setReference] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [context, setContext] = useState(false)
  const [contextRange, setContextRange] = useState(3)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (selectedBibles.length === 0) {
      alert(t('searchForm.alertSelectBible'))
      return
    }

    if (searchType === 'reference') {
      if (!reference.trim()) {
        alert(t('searchForm.alertEnterReference'))
        return
      }
      onPassageLookup({
        reference: reference.trim(),
        bible: selectedBibles,
        context: context,
        context_range: context ? contextRange : undefined,
      })
    } else {
      if (!searchTerm.trim()) {
        alert(t('searchForm.alertEnterSearch'))
        return
      }
      onSearch({
        search: searchTerm.trim(),
        bible: selectedBibles,
        highlight: true,
        context: context,
        context_range: context ? contextRange : undefined,
      })
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      {!defaultSearchType && (
        <div className="search-form-type-selector">
          <label>
            <input
              type="radio"
              name="searchType"
              value="reference"
              checked={searchType === 'reference'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            {t('tabs.lookup')}
          </label>
          <label>
            <input
              type="radio"
              name="searchType"
              value="search"
              checked={searchType === 'search'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            {t('tabs.search')}
          </label>
        </div>
      )}

      <div className="search-form-input-group">
        {searchType === 'reference' ? (
          <div className="search-form-field">
            <label htmlFor="reference">{t('searchForm.bibleReference')}</label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('searchForm.bibleReferencePlaceholder')}
              className="search-form-input"
            />
            <small className="search-form-hint">
              {t('searchForm.bibleReferenceHint')}
            </small>
          </div>
        ) : (
          <div className="search-form-field">
            <label htmlFor="search">{t('searchForm.searchTerms')}</label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchForm.searchTermsPlaceholder')}
              className="search-form-input"
            />
            <small className="search-form-hint">
              {t('searchForm.searchTermsHint')}
            </small>
          </div>
        )}
      </div>

      <div className="search-form-bible-selector">
        <BibleSelector
          selectedBibles={selectedBibles}
          onSelectionChange={onBibleSelectionChange}
          allowMultiple={true}
        />
      </div>

      <div className="search-form-options">
        <label className="search-form-checkbox">
          <input
            type="checkbox"
            checked={context}
            onChange={(e) => setContext(e.target.checked)}
          />
          {t('searchForm.includeContext')}
        </label>
        
        {context && (
          <div className="search-form-context-range">
            <label htmlFor="contextRange">{t('searchForm.contextRange')}</label>
            <input
              id="contextRange"
              type="number"
              min="1"
              max="10"
              value={contextRange}
              onChange={(e) => setContextRange(parseInt(e.target.value, 10) || 3)}
              className="search-form-number-input"
            />
            <span>{t('searchForm.verses')}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="search-form-submit"
        disabled={loading}
      >
        {loading ? t('searchForm.searching') : searchType === 'reference' ? t('searchForm.lookupPassage') : t('searchForm.search')}
      </button>
    </form>
  )
}

export default SearchForm

