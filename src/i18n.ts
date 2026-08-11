import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptTranslation from './locales/pt.json';
import enTranslation from './locales/en.json';
import deTranslation from './locales/de.json';

const resources = {
  pt: { translation: ptTranslation },
  en: { translation: enTranslation },
  de: { translation: deTranslation },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false, // React já faz escape por padrão
    },
  });

export default i18n;
