import { useTranslation } from 'react-i18next'
import CookieConsent from '../CookieConsent/CookieConsent'
import './Layout.css'

function Layout({ children }) {
  const { t } = useTranslation()

  return (
    <div className="layout">
      <header className="layout-header">
        <h1>{t('app.title')}</h1>
      </header>
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <p>
          {t('app.footer.poweredBy')} |{' '}
          <a 
            href="https://github.com/alephcom/bible_study" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            {t('app.footer.githubRepo')}
          </a>
        </p>
      </footer>
      <CookieConsent />
    </div>
  )
}

export default Layout

