import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie'],
      caches: ['localStorage'],
    },
  });

export default i18next;