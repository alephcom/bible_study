import { useState, useEffect } from 'react'
import BibleSelector from '../BibleSelector/BibleSelector'
import PassageDisplay from '../PassageDisplay/PassageDisplay'
import { getBooks, lookupPassage } from '../../services/api'
import './BibleBrowser.css'

function BibleBrowser() {
  const [selectedBibles, setSelectedBibles] = useState([])
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  // Load books on mount
  useEffect(() => {
    loadBooks()
  }, [])

  // Load passage when book/chapter/bible changes
  useEffect(() => {
    if (selectedBook && selectedChapter && selectedBibles.length > 0) {
      loadChapter()
    } else {
      setResults(null)
    }
  }, [selectedBook, selectedChapter, selectedBibles])

  const loadBooks = async () => {
    try {
      setLoadingBooks(true)
      setError(null)
      const result = await getBooks()
      
      if (result.success && result.results) {
        setBooks(result.results)
        // Auto-select first book if available
        if (result.results.length > 0) {
          setSelectedBook(result.results[0])
          setChapters(Array.from({ length: result.results[0].chapters }, (_, i) => i + 1))
        }
      } else {
        setError(result.error?.message || 'Failed to load Bible books')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading books')
    } finally {
      setLoadingBooks(false)
    }
  }

  const loadChapter = async () => {
    if (!selectedBook || !selectedChapter) return

    setLoading(true)
    setError(null)

    try {
      const reference = `${selectedBook.name} ${selectedChapter}`
      const result = await lookupPassage(reference, selectedBibles, {
        data_format: 'passage',
      })

      if (result.success) {
        setResults(result.results || {})
      } else {
        setError(result.error?.message || 'Failed to load chapter')
        setResults(null)
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading chapter')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBookChange = (bookId) => {
    const book = books.find(b => b.id === parseInt(bookId, 10))
    if (book) {
      setSelectedBook(book)
      setSelectedChapter(1)
      setChapters(Array.from({ length: book.chapters }, (_, i) => i + 1))
      setResults(null)
    }
  }

  const handleChapterChange = (chapter) => {
    setSelectedChapter(parseInt(chapter, 10))
  }

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1)
    }
  }

  const handleNextChapter = () => {
    if (selectedBook && selectedChapter < selectedBook.chapters) {
      setSelectedChapter(selectedChapter + 1)
    }
  }

  const handleBibleSelectionChange = (bibles) => {
    setSelectedBibles(bibles)
  }

  // Group books by Testament
  const oldTestament = books.filter(b => b.id <= 39)
  const newTestament = books.filter(b => b.id > 39 && b.id <= 66)

  return (
    <div className="bible-browser">
      <div className="bible-browser-controls">
        <div className="bible-browser-section">
          <h2>Browse the Bible</h2>
          <div className="bible-browser-selectors">
            <div className="browser-selector-group">
              <label htmlFor="book-select">Book:</label>
              <select
                id="book-select"
                value={selectedBook?.id || ''}
                onChange={(e) => handleBookChange(e.target.value)}
                className="browser-select"
                disabled={loadingBooks || books.length === 0}
              >
                <option value="">Select a book...</option>
                {oldTestament.length > 0 && (
                  <optgroup label="Old Testament">
                    {oldTestament.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {newTestament.length > 0 && (
                  <optgroup label="New Testament">
                    {newTestament.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {selectedBook && (
              <div className="browser-selector-group">
                <label htmlFor="chapter-select">Chapter:</label>
                <div className="chapter-navigation">
                  <button
                    onClick={handlePreviousChapter}
                    disabled={selectedChapter <= 1}
                    className="chapter-nav-button"
                    title="Previous Chapter"
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
                    disabled={!selectedBook || selectedChapter >= selectedBook.chapters}
                    className="chapter-nav-button"
                    title="Next Chapter"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bible-browser-section">
          <BibleSelector
            selectedBibles={selectedBibles}
            onSelectionChange={handleBibleSelectionChange}
            allowMultiple={true}
          />
        </div>
      </div>

      {loadingBooks && (
        <div className="bible-browser-loading">
          <div className="loading-spinner"></div>
          <p>Loading Bible books...</p>
        </div>
      )}

      {error && (
        <div className="bible-browser-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadBooks}>Retry</button>
        </div>
      )}

      {loading && (
        <div className="bible-browser-loading">
          <div className="loading-spinner"></div>
          <p>Loading chapter...</p>
        </div>
      )}

      {!loading && !error && results && selectedBook && (
        <div className="bible-browser-content">
          <div className="bible-browser-header">
            <h2>
              {selectedBook.name} {selectedChapter}
            </h2>
          </div>
          <PassageDisplay
            results={results}
            highlight={false}
          />
        </div>
      )}

      {!loading && !loadingBooks && !error && selectedBook && selectedBibles.length === 0 && (
        <div className="bible-browser-message">
          <p>Please select at least one Bible version to view the chapter.</p>
        </div>
      )}
    </div>
  )
}

export default BibleBrowser

