import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import pt from './locales/pt.json'
import it from './locales/it.json'
import nl from './locales/nl.json'
import ru from './locales/ru.json'
import zh from './locales/zh.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ar from './locales/ar.json'
import hi from './locales/hi.json'
import pl from './locales/pl.json'
import tr from './locales/tr.json'
import sv from './locales/sv.json'
import da from './locales/da.json'
import fi from './locales/fi.json'
import no from './locales/no.json'
import cs from './locales/cs.json'
import ro from './locales/ro.json'
import hu from './locales/hu.json'
import el from './locales/el.json'
import he from './locales/he.json'
import id from './locales/id.json'
import vi from './locales/vi.json'
import th from './locales/th.json'

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  it: { translation: it },
  nl: { translation: nl },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  hi: { translation: hi },
  pl: { translation: pl },
  tr: { translation: tr },
  sv: { translation: sv },
  da: { translation: da },
  fi: { translation: fi },
  no: { translation: no },
  cs: { translation: cs },
  ro: { translation: ro },
  hu: { translation: hu },
  el: { translation: el },
  he: { translation: he },
  id: { translation: id },
  vi: { translation: vi },
  th: { translation: th },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n

