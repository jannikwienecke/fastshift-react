import { makeResources } from '@apps-next/core';
import { resources } from '@apps-next/shared';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { i18nextPlugin } from 'translation-check';

export { t } from 'i18next';

export const initI18n = () => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .use(i18nextPlugin)
    .init({
      fallbackLng: 'en',
      resources: makeResources(resources, {
        'filter.button.label': {
          en: 'Filter',
          de: 'Filter.',
        },
      }),
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
      debug: false,
    });
};
