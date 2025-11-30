import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchForm from './SearchForm'
import PassageDisplay from '../PassageDisplay/PassageDisplay'
import SearchResults from '../SearchResults/SearchResults'
import BibleSelector from '../BibleSelector/BibleSelector'
import { search, lookupPassage, getBooks, getBibles } from '../../services/api'
import { getSelectedBibles, saveSelectedBibles, hasCookieConsent } from '../../utils/cookies'
import { getBibleDisplayName } from '../../utils/bibleInfo'
import { getDefaultBibleModules } from '../../utils/language'
import { getUrlState, buildUrlState } from '../../utils/urlState'
import './SearchPage.css'

function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlStateLoaded = useRef(false)
  const loadingFromUrl = useRef(false)
  const [activeTab, setActiveTab] = useState('lookup') // 'lookup', 'search', or 'browse'
  const [selectedBibles, setSelectedBibles] = useState([])
  const [bibleInfo, setBibleInfo] = useState({}) // Map of module -> Bible name
  const [availableBibles, setAvailableBibles] = useState({}) // Map of available Bible modules
  
  // Load Bible information for display
  useEffect(() => {
    loadBibleInfo()
  }, [])

  // Function to update URL with current state
  const updateUrlState = (updates) => {
    // Don't update URL if we're currently loading from URL
    if (loadingFromUrl.current) {
      return
    }
    
    const urlState = getUrlState(searchParams)
    const newState = {
      tab: updates.tab !== undefined ? updates.tab : urlState.tab || activeTab,
      ref: updates.ref !== undefined ? updates.ref : (updates.ref === null ? null : urlState.ref),
      search: updates.search !== undefined ? updates.search : (updates.search === null ? null : urlState.search),
      book: updates.book !== undefined ? updates.book : (updates.book === null ? null : urlState.book),
      chapter: updates.chapter !== undefined ? updates.chapter : (updates.chapter === null ? null : urlState.chapter),
      bibles: updates.bibles !== undefined ? updates.bibles : urlState.bibles.length > 0 ? urlState.bibles : selectedBibles,
    }
    
    const params = buildUrlState(newState)
    setSearchParams(params, { replace: false })
  }

  // Load selected Bibles from URL, cookies, or set language-based defaults
  useEffect(() => {
    if (availableBibles && Object.keys(availableBibles).length > 0 && !urlStateLoaded.current) {
      const urlState = getUrlState(searchParams)
      let biblesToSet = []
      
      // Priority 1: URL parameters
      if (urlState.bibles && urlState.bibles.length > 0) {
        const validUrlBibles = urlState.bibles.filter(module => availableBibles[module])
        if (validUrlBibles.length > 0) {
          biblesToSet = validUrlBibles
        }
      }
      
      // Priority 2: Cookies (if no URL bibles)
      if (biblesToSet.length === 0 && hasCookieConsent()) {
        const saved = getSelectedBibles()
        if (saved && saved.length > 0) {
          const validSaved = saved.filter(module => availableBibles[module])
          if (validSaved.length > 0) {
            biblesToSet = validSaved
          }
        }
      }
      
      // Priority 3: Language-based defaults
      if (biblesToSet.length === 0) {
        biblesToSet = getDefaultBibleModules(availableBibles)
      }
      
      if (biblesToSet.length > 0 && selectedBibles.length === 0) {
        setSelectedBibles(biblesToSet)
        if (hasCookieConsent() && !urlState.bibles) {
          saveSelectedBibles(biblesToSet)
        }
      }
      
      // Load tab from URL
      if (urlState.tab && ['lookup', 'search', 'browse'].includes(urlState.tab)) {
        setActiveTab(urlState.tab)
      }
      
      urlStateLoaded.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableBibles, searchParams])

  const loadBibleInfo = async () => {
    try {
      const result = await getBibles({ order_by_lang_name: true })
      if (result.success && result.results) {
        // Store available Bibles for default selection
        setAvailableBibles(result.results)
        
        // Create a map of module -> display name
        const infoMap = {}
        Object.keys(result.results).forEach(module => {
          const bible = result.results[module]
          infoMap[module] = getBibleDisplayName(bible)
        })
        setBibleInfo(infoMap)
      }
    } catch (err) {
      console.error('Failed to load Bible info:', err)
    }
  }
  
  // Search state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [searchTerms, setSearchTerms] = useState(null)
  const [isSearch, setIsSearch] = useState(false)
  const [metadata, setMetadata] = useState(null)

  // Browse state
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [chapters, setChapters] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [browseLoading, setBrowseLoading] = useState(false)
  const [browseError, setBrowseError] = useState(null)

  // Load lookup/search from URL after initial setup
  useEffect(() => {
    if (availableBibles && Object.keys(availableBibles).length > 0 && selectedBibles.length > 0 && urlStateLoaded.current && !loadingFromUrl.current) {
      const urlState = getUrlState(searchParams)
      
      if (urlState.ref && !results && !loading) {
        loadingFromUrl.current = true
        setActiveTab('lookup')
        handlePassageLookup({
          reference: urlState.ref,
          bible: selectedBibles,
          context: false,
        })
        setTimeout(() => {
          loadingFromUrl.current = false
        }, 1000)
      } else if (urlState.search && !results && !loading) {
        loadingFromUrl.current = true
        setActiveTab('search')
        handleSearch({
          search: urlState.search,
          bible: selectedBibles,
          highlight: true,
          context: false,
        })
        setTimeout(() => {
          loadingFromUrl.current = false
        }, 1000)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBibles.length, urlStateLoaded.current])

  // Load books when browsing tab is active
  useEffect(() => {
    if (activeTab === 'browse' && books.length === 0) {
      loadBooks()
    }
  }, [activeTab])

  // Load browse state from URL after books are loaded
  useEffect(() => {
    if (books.length > 0 && urlStateLoaded.current && !loadingFromUrl.current) {
      const urlState = getUrlState(searchParams)
      if (urlState.book && urlState.chapter && activeTab === 'browse') {
        const book = books.find(b => b.name === urlState.book)
        if (book && (!selectedBook || selectedBook.name !== urlState.book || selectedChapter !== parseInt(urlState.chapter, 10))) {
          loadingFromUrl.current = true
          setSelectedBook(book)
          const chapterNum = parseInt(urlState.chapter, 10) || 1
          setSelectedChapter(chapterNum)
          setChapters(Array.from({ length: book.chapters }, (_, i) => i + 1))
          setTimeout(() => {
            loadingFromUrl.current = false
          }, 500)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, urlStateLoaded.current, activeTab])

  // Load chapter when book/chapter/bible changes in browse mode
  useEffect(() => {
    if (activeTab === 'browse' && selectedBook && selectedChapter && selectedBibles.length > 0) {
      loadChapter()
    } else if (activeTab === 'browse') {
      setResults(null)
    }
  }, [selectedBook, selectedChapter, selectedBibles, activeTab])

  const loadBooks = async () => {
    try {
      setLoadingBooks(true)
      setBrowseError(null)
      const result = await getBooks()
      
      if (result.success && result.results) {
        setBooks(result.results)
        // Auto-select first book if available and not loading from URL
        const urlState = getUrlState(searchParams)
        if (result.results.length > 0 && !urlState.book) {
          setSelectedBook(result.results[0])
          setChapters(Array.from({ length: result.results[0].chapters }, (_, i) => i + 1))
        }
      } else {
        setBrowseError(result.error?.message || 'Failed to load Bible books')
      }
    } catch (err) {
      setBrowseError(err.message || 'An error occurred while loading books')
    } finally {
      setLoadingBooks(false)
    }
  }

  const loadChapter = async () => {
    if (!selectedBook || !selectedChapter) return

    setBrowseLoading(true)
    setBrowseError(null)

    try {
      const reference = `${selectedBook.name} ${selectedChapter}`
      const result = await lookupPassage(reference, selectedBibles, {
        data_format: 'passage',
      })

      if (result.success) {
        setResults(result.results || {})
        // Update URL for browse mode
        updateUrlState({
          tab: 'browse',
          book: selectedBook.name,
          chapter: selectedChapter,
          bibles: selectedBibles,
        })
      } else {
        setBrowseError(result.error?.message || 'Failed to load chapter')
        setResults(null)
      }
    } catch (err) {
      setBrowseError(err.message || 'An error occurred while loading chapter')
      setResults(null)
    } finally {
      setBrowseLoading(false)
    }
  }

  const handleSearch = async (options) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setSearchTerms(options.search ? options.search.split(/\s+/) : null)
    setIsSearch(true)

    // Update URL
    updateUrlState({
      tab: 'search',
      search: options.search,
      ref: null,
      book: null,
      chapter: null,
      bibles: options.bible,
    })

    try {
      const result = await search(options.search, options.bible, {
        highlight: options.highlight || false,
        context: options.context || false,
        context_range: options.context_range || 3,
        data_format: 'passage',
        page: 1,
        page_limit: 50,
      })

      if (result.success) {
        setResults(result.results || {})
        setMetadata(result.metadata)
      } else {
        setError(result.error?.message || 'Search failed')
        setResults(null)
      }
    } catch (err) {
      setError(err.message || 'An error occurred during search')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePassageLookup = async (options) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setSearchTerms(null)
    setIsSearch(false) // This is for lookup, not search

    // Update URL
    updateUrlState({
      tab: 'lookup',
      ref: options.reference,
      search: null,
      book: null,
      chapter: null,
      bibles: options.bible,
    })

    try {
      const result = await lookupPassage(options.reference, options.bible, {
        data_format: 'passage',
        context: options.context || false,
        context_range: options.context_range || 3,
      })

      if (result.success) {
        setResults(result.results || {})
        setMetadata(result.metadata)
      } else {
        setError(result.error?.message || 'Passage lookup failed')
        setResults(null)
      }
    } catch (err) {
      setError(err.message || 'An error occurred during passage lookup')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBibleSelectionChange = (bibles) => {
    setSelectedBibles(bibles)
    // Save to cookie if consent given
    if (hasCookieConsent()) {
      saveSelectedBibles(bibles)
    }
    // Update URL
    updateUrlState({ bibles })
  }

  const handleBookChange = (bookId) => {
    const book = books.find(b => b.id === parseInt(bookId, 10))
    if (book) {
      setSelectedBook(book)
      setSelectedChapter(1)
      setChapters(Array.from({ length: book.chapters }, (_, i) => i + 1))
      setResults(null)
      // Update URL
      updateUrlState({
        tab: 'browse',
        book: book.name,
        chapter: 1,
        ref: null,
        search: null,
      })
    }
  }

  const handleChapterChange = (chapter) => {
    const chapterNum = parseInt(chapter, 10)
    setSelectedChapter(chapterNum)
    // Update URL
    if (selectedBook) {
      updateUrlState({
        tab: 'browse',
        book: selectedBook.name,
        chapter: chapterNum,
      })
    }
  }

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      const newChapter = selectedChapter - 1
      setSelectedChapter(newChapter)
      // URL will be updated by loadChapter effect
    } else {
      // If at first chapter, move to last chapter of previous book
      handlePreviousBook()
    }
  }

  const handleNextChapter = () => {
    if (selectedBook && selectedChapter < selectedBook.chapters) {
      const newChapter = selectedChapter + 1
      setSelectedChapter(newChapter)
      // URL will be updated by loadChapter effect
    } else {
      // If at last chapter, move to first chapter of next book
      handleNextBook()
    }
  }

  const handlePreviousBook = () => {
    if (!selectedBook || books.length === 0) return

    const currentIndex = books.findIndex(b => b.id === selectedBook.id)
    if (currentIndex > 0) {
      const prevBook = books[currentIndex - 1]
      setSelectedBook(prevBook)
      setSelectedChapter(prevBook.chapters) // Go to last chapter of previous book
      setChapters(Array.from({ length: prevBook.chapters }, (_, i) => i + 1))
      setResults(null)
      // Update URL
      updateUrlState({
        tab: 'browse',
        book: prevBook.name,
        chapter: prevBook.chapters,
      })
    }
  }

  const handleNextBook = () => {
    if (!selectedBook || books.length === 0) return

    const currentIndex = books.findIndex(b => b.id === selectedBook.id)
    if (currentIndex < books.length - 1) {
      const nextBook = books[currentIndex + 1]
      setSelectedBook(nextBook)
      setSelectedChapter(1) // Go to first chapter of next book
      setChapters(Array.from({ length: nextBook.chapters }, (_, i) => i + 1))
      setResults(null)
      // Update URL
      updateUrlState({
        tab: 'browse',
        book: nextBook.name,
        chapter: 1,
      })
    }
  }

  // Group books by Testament
  const oldTestament = books.filter(b => b.id <= 39)
  const newTestament = books.filter(b => b.id > 39 && b.id <= 66)
  
  // Find current book index for navigation
  const currentBookIndex = selectedBook ? books.findIndex(b => b.id === selectedBook.id) : -1
  const isFirstBook = currentBookIndex === 0
  const isLastBook = currentBookIndex === books.length - 1

  return (
    <div className="search-page">
      <div className="search-page-content">
        {/* Tab Navigation */}
        <div className="page-tabs">
          <button
            className={`tab-button ${activeTab === 'lookup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('lookup')
              setResults(null)
              setError(null)
              updateUrlState({
                tab: 'lookup',
                search: null,
                book: null,
                chapter: null,
              })
            }}
          >
            {t('tabs.lookup')}
          </button>
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('search')
              setResults(null)
              setError(null)
              updateUrlState({
                tab: 'search',
                ref: null,
                book: null,
                chapter: null,
              })
            }}
          >
            {t('tabs.search')}
          </button>
          <button
            className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('browse')
              setResults(null)
              setError(null)
              updateUrlState({
                tab: 'browse',
                ref: null,
                search: null,
              })
            }}
          >
            {t('tabs.browse')}
          </button>
        </div>

        {/* Lookup Tab */}
        {activeTab === 'lookup' && (
          <>
            <SearchForm
              onSearch={handleSearch}
              onPassageLookup={handlePassageLookup}
              selectedBibles={selectedBibles}
              onBibleSelectionChange={handleBibleSelectionChange}
              loading={loading}
              defaultSearchType="reference"
            />
            {loading && (
              <div className="search-page-loading">
                <div className="loading-spinner"></div>
                <p>{t('loading.loading')}</p>
              </div>
            )}

            {error && (
              <div className="search-page-error">
                <h3>{t('errors.error')}</h3>
                <p>{error}</p>
                {metadata?.errors && metadata.errors.length > 0 && (
                  <ul>
                    {metadata.errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!loading && !error && results && (
              <div className="search-page-results">
                <PassageDisplay
                  results={results}
                  highlight={false}
                  bibleInfo={bibleInfo}
                />
              </div>
            )}
          </>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            <SearchForm
              onSearch={handleSearch}
              onPassageLookup={handlePassageLookup}
              selectedBibles={selectedBibles}
              onBibleSelectionChange={handleBibleSelectionChange}
              loading={loading}
              defaultSearchType="search"
            />

            {loading && (
              <div className="search-page-loading">
                <div className="loading-spinner"></div>
                <p>{t('loading.loading')}</p>
              </div>
            )}

            {error && (
              <div className="search-page-error">
                <h3>{t('errors.error')}</h3>
                <p>{error}</p>
                {metadata?.errors && metadata.errors.length > 0 && (
                  <ul>
                    {metadata.errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!loading && !error && results && (
              <div className="search-page-results">
                <SearchResults
                  results={results}
                  searchTerms={searchTerms}
                  metadata={metadata}
                  bibleInfo={bibleInfo}
                />
              </div>
            )}
          </>
        )}

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <>
            <div className="browse-controls">
              <div className="browse-selectors">
                <div className="browser-selector-group">
                  <label htmlFor="book-select">{t('browse.book')}</label>
                  <div className="book-navigation">
                    <button
                      onClick={handlePreviousBook}
                      disabled={loadingBooks || books.length === 0 || isFirstBook}
                      className="book-nav-button"
                      title={t('browse.previousBook')}
                    >
                      «
                    </button>
                    <select
                      id="book-select"
                      value={selectedBook?.id || ''}
                      onChange={(e) => handleBookChange(e.target.value)}
                      className="browser-select"
                      disabled={loadingBooks || books.length === 0}
                    >
                      <option value="">{t('browse.selectBook')}</option>
                      {oldTestament.length > 0 && (
                        <optgroup label={t('browse.oldTestament')}>
                          {oldTestament.map(book => (
                            <option key={book.id} value={book.id}>
                              {book.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {newTestament.length > 0 && (
                        <optgroup label={t('browse.newTestament')}>
                          {newTestament.map(book => (
                            <option key={book.id} value={book.id}>
                              {book.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <button
                      onClick={handleNextBook}
                      disabled={loadingBooks || books.length === 0 || isLastBook}
                      className="book-nav-button"
                      title={t('browse.nextBook')}
                    >
                      »
                    </button>
                  </div>
                </div>

                {selectedBook && (
                  <div className="browser-selector-group">
                    <label htmlFor="chapter-select">{t('browse.chapter')}</label>
                    <div className="chapter-navigation">
                      <button
                        onClick={handlePreviousChapter}
                        disabled={!selectedBook || (selectedChapter <= 1 && isFirstBook)}
                        className="chapter-nav-button"
                        title={t('browse.previousChapter')}
                      >
                        ‹
                      </button>
                      <select
                        id="chapter-select"
                        value={selectedChapter}
                        onChange={(e) => handleChapterChange(e.target.value)}
                        className="browser-select"
                      >
                        {chapters.map(ch => (
                          <option key={ch} value={ch}>
                            {ch}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleNextChapter}
                        disabled={!selectedBook || (selectedChapter >= selectedBook.chapters && isLastBook)}
                        className="chapter-nav-button"
                        title={t('browse.nextChapter')}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="browse-bible-selector">
                <BibleSelector
                  selectedBibles={selectedBibles}
                  onSelectionChange={handleBibleSelectionChange}
                  allowMultiple={true}
                />
              </div>
            </div>

            {loadingBooks && (
              <div className="search-page-loading">
                <div className="loading-spinner"></div>
                <p>{t('browse.loadingBooks')}</p>
              </div>
            )}

            {browseError && (
              <div className="search-page-error">
                <h3>{t('errors.error')}</h3>
                <p>{browseError}</p>
                <button onClick={loadBooks}>{t('bibleSelector.retry')}</button>
              </div>
            )}

            {browseLoading && (
              <div className="search-page-loading">
                <div className="loading-spinner"></div>
                <p>{t('browse.loadingChapter')}</p>
              </div>
            )}

            {!browseLoading && !browseError && results && selectedBook && (
              <div className="search-page-results">
                <div className="browse-header">
                  <h2>
                    {selectedBook.name} {selectedChapter}
                  </h2>
                </div>
                <PassageDisplay
                  results={results}
                  highlight={false}
                  bibleInfo={bibleInfo}
                />
              </div>
            )}

            {!browseLoading && !loadingBooks && !browseError && selectedBook && selectedBibles.length === 0 && (
              <div className="browse-message">
                <p>{t('browse.selectBible')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
