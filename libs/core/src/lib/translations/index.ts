import { en } from './en';
import { de } from './de';
import { t as tI18n } from 'i18next';
import { useTranslation as useTranslationReact } from 'react-i18next';
import React from 'react';

export const baseResources = {
  en: {
    translation: en,
  },
  de: {
    translation: de,
  },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const t: typeof tI18n = (...args) => {
  return tI18n(...args);
};

export type FunctionArgs = Parameters<typeof tI18n>[0];

export type InferTranslationKeys<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: T[K] extends Record<string, unknown>
        ? `${string & K}.${InferTranslationKeys<T[K]>}`
        : string & K;
    }[keyof T]
  : never;

export type TranslationKeys = InferTranslationKeys<
  typeof baseResources.en.translation
>;

export const useTranslation = () => {
  const { t } = useTranslationReact();

  const translate = (
    key: TranslationKeys,
    options?: Record<string, unknown>
  ) => {
    return t(key, options);
  };

  const returnObj = React.useMemo(() => ({ t: translate }), []);

  return returnObj;
};

export const makeResources = <
  T extends Record<string, { translation: Record<string, unknown> }>
>(
  resources: T,
  override?: {
    [key in TranslationKeys]?: {
      [key: string]: string;
    };
  }
): T => {
  const overrideResources = override ?? {};

  return Object.keys(resources).reduce(
    (mergedResources, lang) => {
      if (lang in baseResources) {
        mergedResources = {
          ...mergedResources,
          [lang]: {
            translation: {
              ...(baseResources[lang as keyof typeof baseResources]
                .translation || {}),
              ...(resources[lang as keyof T]?.translation || {}),
            },
          },
        };

        Object.entries(overrideResources).forEach(([key, value]) => {
          const keys = key.split('.');
          let current: any = mergedResources[lang]?.translation;
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i] as string;
            if (!(key in current)) {
              current[key] = {};
            }
            current = current[key];
          }
          current[keys[keys.length - 1] as string] =
            value[lang] ?? current[keys[keys.length - 1] as string];
        });
      }
      return mergedResources;
    },
    { ...baseResources } as unknown as T
  );
};
