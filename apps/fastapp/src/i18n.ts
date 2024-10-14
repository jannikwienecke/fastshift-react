import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nextPlugin } from 'translation-check';

import enTranslations from './locales/en';
import deTranslations from './locales/de';

export const resources = {
  en: {
    translation: enTranslations,
  },
  de: {
    translation: deTranslations,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(i18nextPlugin)
  .init({
    fallbackLng: 'en',
    resources,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    debug: true,
  });

// Add this type declaration
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enTranslations;
    };
  }
}

export default i18n;

// i18next.init({
//     lng: 'de',
//     fallbackLng: 'en',
//     resources: {
//       en: {
//         translation: {
//           welcome: {
//             title: 'Welcome to React',
//             test: 'Count: {{count, number}}',
//           },
//         },
//       },
//       de: {
//         translation: {
//           'welcome.title': 'Willkommen zu React',
//           'welcome.test': 'Anzahl: {{count, number}}',
//           project_one: 'Projekt',
//           project_other: 'Projekte',
//           dessert_chocolate: 'Schokolade',
//           dessert_icecream: 'Eis',
//           dessert: 'Ich mag Nachtisch',
//         },
//       },
//     },
//   });

//   console.log(i18next.t('welcome.title'));
//   console.log(i18next.t('welcome.test', { count: 1000000.2 }));
//   console.log(i18next.t('project_one'));
//   console.log(i18next.t('project_other', { count: 10 }));
//   // CONTEXT AWARE
//   console.log(i18next.t('dessert', { context: 'chocolate' }));
//   console.log(i18next.t('dessert', { context: 'icecream' }));
//   console.log(i18next.t('dessert'));
