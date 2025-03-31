import {
  ADD_NEW_OPTION,
  ComboxboxItem,
  getViewLabel,
  t,
  TranslationKeys,
  ViewConfigType,
} from '@apps-next/core';
import { PlusIcon } from 'lucide-react';

export const makeAddNewCommand = (view: ViewConfigType): ComboxboxItem => {
  const label = getViewLabel(view, true);

  return {
    id: ADD_NEW_OPTION,
    label: t('common.createNew' satisfies TranslationKeys, {
      name: label,
    }),
    icon: PlusIcon,
    viewName: view.viewName,
  };
};
