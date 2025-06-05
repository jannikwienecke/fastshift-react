import { t } from 'i18next';

import { baseResources, InferTranslationKeys } from '@apps-next/core';
import deTranslations from './locales/de';
import enTranslations from './locales/en';

export const resources = {
  en: {
    translation: enTranslations,
  },
  de: {
    translation: deTranslations,
  },
} as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enTranslations & typeof baseResources.en.translation;
    };
  }
}

export type TranslationType = InferTranslationKeys<typeof enTranslations>;

t('common.delete');
t('filter.button.label');
// @ts-expect-error invalid key
t('filter.invalid');

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

//   console.warn(i18next.t('welcome.title'));
//   console.warn(i18next.t('welcome.test', { count: 1000000.2 }));
//   console.warn(i18next.t('project_one'));
//   console.warn(i18next.t('project_other', { count: 10 }));
//   // CONTEXT AWARE
//   console.warn(i18next.t('dessert', { context: 'chocolate' }));
//   console.warn(i18next.t('dessert', { context: 'icecream' }));
//   console.warn(i18next.t('dessert'));
