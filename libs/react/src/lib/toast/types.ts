import { TranslationKeys } from '@apps-next/core';

export interface ToastProps {
  id: string | number;
  title: TranslationKeys;
  description: string;
  variant?: 'default' | 'warning' | 'error';
  duration?: number;
  button?: {
    label: string;
    onClick: () => void;
  };
}
