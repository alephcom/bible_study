import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PassageDisplay from '../PassageDisplay/PassageDisplay'
import './SearchResults.css'

function SearchResults({ results, searchTerms, metadata, bibleInfo = null }) {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit] = useState(50)

  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="search-results empty">
        <p>{t('searchResults.noResults')}</p>
      </div>
    )
  }

  // Get total count from metadata if available
  const totalResults = metadata?.list?.total || 0
  const totalPages = metadata?.list?.pages || 1

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h2>{t('searchResults.title')}</h2>
        {totalResults > 0 && (
          <p className="search-results-count">
            {t('searchResults.found')} {totalResults} {totalResults !== 1 ? t('searchResults.results') : t('searchResults.result')}
          </p>
        )}
      </div>

      <PassageDisplay
        results={results}
        highlight={true}
        searchTerms={searchTerms}
        bibleInfo={bibleInfo}
      />

      {totalPages > 1 && (
        <div className="search-results-pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            {t('searchResults.previous')}
          </button>
          <span className="pagination-info">
            {t('searchResults.page')} {currentPage} {t('searchResults.of')} {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            {t('searchResults.next')}
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchResults

