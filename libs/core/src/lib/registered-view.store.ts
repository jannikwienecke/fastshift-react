import { atom } from 'jotai';
import { RegisteredViews } from './types';
import { relationalViewHelper } from './relational-view.helper';

export const registeredViewsAtom = atom<RegisteredViews>({});

export const viewsHelperAtom = atom((get) => {
  return {
    get: (tableName: string) =>
      relationalViewHelper(tableName, get(registeredViewsAtom)),
    getDisplayField(tableName: string) {
      return (
        relationalViewHelper(tableName, get(registeredViewsAtom)).relationalView
          .displayField.field ?? 'id'
      );
    },
  };
});
