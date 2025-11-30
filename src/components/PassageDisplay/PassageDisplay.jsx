import { useTranslation } from 'react-i18next'
import { highlightSearchTerms } from '../../utils/formatters'
import { formatBibleModule } from '../../utils/bibleInfo'
import './PassageDisplay.css'

function PassageDisplay({ results, highlight = false, searchTerms = null, bibleInfo = null }) {
  const { t } = useTranslation()
  // Debug: Log the results structure to help troubleshoot
  if (process.env.NODE_ENV === 'development') {
    console.log('PassageDisplay received results:', results)
  }

  if (!results) {
    return (
      <div className="passage-display empty">
        <p>{t('passageDisplay.empty')}</p>
      </div>
    )
  }

  // Handle case where results is an array directly (from Passage formatter)
  if (Array.isArray(results)) {
    if (results.length === 0) {
      return (
        <div className="passage-display empty">
          <p>{t('passageDisplay.empty')}</p>
        </div>
      )
    }
    
    // Extract Bible modules from the nested structure
    const bibleModules = extractBibleModules(results)
    const isParallel = bibleModules.length > 1

    return (
      <div className={`passage-display ${isParallel ? 'parallel' : 'single'}`}>
        {bibleModules.map(module => {
          // Get Bible name for this module
          const bibleName = bibleInfo?.[module] || formatBibleModule(module)
          
          return (
            <div key={module} className="passage-display-bible">
              {isParallel && (
                <div className="bible-version-header">
                  <h4 className="bible-version-title">{bibleName}</h4>
                </div>
              )}
              <PassageList
                passages={results}
                module={module}
                highlight={highlight}
                searchTerms={searchTerms}
              />
            </div>
          )
        })}
      </div>
    )
  }

  // Handle case where results is an object keyed by Bible module (legacy format)
  const bibleModules = Object.keys(results)
  if (bibleModules.length === 0) {
    return (
      <div className="passage-display empty">
        <p>{t('passageDisplay.empty')}</p>
      </div>
    )
  }

  const isParallel = bibleModules.length > 1

  return (
    <div className={`passage-display ${isParallel ? 'parallel' : 'single'}`}>
      {bibleModules.map(module => {
        const passages = results[module]
        let passagesArray = Array.isArray(passages) ? passages : []
        
        if (passagesArray.length === 0) {
          return null
        }

        // Get Bible name for this module
        const bibleName = bibleInfo?.[module] || formatBibleModule(module)

        return (
          <div key={module} className="passage-display-bible">
            {isParallel && (
              <div className="bible-version-header">
                <h4 className="bible-version-title">{bibleName}</h4>
              </div>
            )}
            <PassageList
              passages={passagesArray}
              module={module}
              highlight={highlight}
              searchTerms={searchTerms}
            />
          </div>
        )
      })}
    </div>
  )
}

/**
 * Extract all Bible modules from the passage structure
 */
function extractBibleModules(passages) {
  const modules = new Set()
  
  passages.forEach(passage => {
    if (passage.verses && typeof passage.verses === 'object') {
      Object.keys(passage.verses).forEach(module => {
        modules.add(module)
      })
    }
  })
  
  return Array.from(modules)
}

function PassageList({ passages, module, highlight, searchTerms }) {
  if (!passages || !Array.isArray(passages) || passages.length === 0) {
    return (
      <div className="passage-list">
        <p className="passage-empty">No passages to display</p>
      </div>
    )
  }

  // Extract verses for this specific module from the nested structure
  const extractedVerses = []
  
  passages.forEach(passage => {
    if (!passage.verses || !passage.verses[module]) {
      return
    }

    const moduleVerses = passage.verses[module]
    const bookName = passage.book_name || passage.book_short || 'Unknown'
    
    // Iterate through chapters
    Object.keys(moduleVerses).forEach(chapterNum => {
      const chapterVerses = moduleVerses[chapterNum]
      
      // Iterate through verses in this chapter
      Object.keys(chapterVerses).forEach(verseNum => {
        const verse = chapterVerses[verseNum]
        extractedVerses.push({
          ...verse,
          book_name: bookName,
          chapter: parseInt(chapterNum, 10),
          verse: parseInt(verseNum, 10),
        })
      })
    })
  })

  // Sort verses by book, chapter, and verse number
  extractedVerses.sort((a, b) => {
    if (a.book !== b.book) return a.book - b.book
    if (a.chapter !== b.chapter) return a.chapter - b.chapter
    return a.verse - b.verse
  })

  // Group by book and chapter for display
  const grouped = groupVersesByBookAndChapter(extractedVerses)

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="passage-list">
              <p className="passage-empty">{t('passageDisplay.noVerses')}</p>
      </div>
    )
  }

  return (
    <div className="passage-list">
      {Object.keys(grouped).map(key => {
        const { book, chapter, verses } = grouped[key]
        return (
          <div key={key} className="passage-chapter">
            <h3 className="passage-header">
              {book} {chapter}
            </h3>
            <div className="passage-verses">
              {verses.map((verse, index) => (
                <VerseDisplay
                  key={`${verse.chapter}-${verse.verse}-${index}`}
                  verse={verse}
                  highlight={highlight}
                  searchTerms={searchTerms}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VerseDisplay({ verse, highlight, searchTerms }) {
  const verseNumber = verse.verse || ''
  const verseText = verse.text || ''
  
  // Apply highlighting if needed
  let displayText = verseText
  if (highlight && searchTerms && verseText) {
    displayText = highlightSearchTerms(verseText, searchTerms, 'mark')
  }

  if (!verseText) {
    return null
  }

  return (
    <div className="passage-verse">
      <span className="verse-number">{verseNumber}</span>
      <span
        className="verse-text"
        dangerouslySetInnerHTML={{ __html: displayText }}
      />
    </div>
  )
}

/**
 * Group verses by book and chapter for organized display
 */
function groupVersesByBookAndChapter(verses) {
  const grouped = {}

  verses.forEach(verse => {
    if (!verse || typeof verse !== 'object') {
      return
    }

    const book = verse.book_name || 'Unknown'
    const chapter = verse.chapter || ''
    const key = `${book}-${chapter}`

    if (!grouped[key]) {
      grouped[key] = {
        book,
        chapter,
        verses: [],
      }
    }

    grouped[key].verses.push(verse)
  })

  // Sort verses within each group
  Object.keys(grouped).forEach(key => {
    grouped[key].verses.sort((a, b) => {
      return a.verse - b.verse
    })
  })

  return grouped
}

export default PassageDisplay
