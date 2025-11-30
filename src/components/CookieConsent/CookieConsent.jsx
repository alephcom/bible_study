import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { hasCookieConsent, setCookieConsent } from '../../utils/cookies'
import './CookieConsent.css'

function CookieConsent() {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show if consent hasn't been given yet
    if (!hasCookieConsent()) {
      // Small delay to allow page to load first
      setTimeout(() => {
        setShow(true)
      }, 500)
    }
  }, [])

  const handleAccept = () => {
    setCookieConsent(true)
    setShow(false)
  }

  const handleDecline = () => {
    setCookieConsent(false)
    setShow(false)
  }

  if (!show) {
    return null
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          <h3>{t('cookieConsent.title')}</h3>
          <p>
            {t('cookieConsent.message')}
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button
            onClick={handleDecline}
            className="cookie-consent-button cookie-consent-decline"
          >
            {t('cookieConsent.decline')}
          </button>
          <button
            onClick={handleAccept}
            className="cookie-consent-button cookie-consent-accept"
          >
            {t('cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent

