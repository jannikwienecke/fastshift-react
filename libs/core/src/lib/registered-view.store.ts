import { atom } from 'jotai';
import { RegisteredViews } from './types';
import { relationalViewHelper } from './relational-view.helper';

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

export const registeredViewsAtom = atom<RegisteredViews>({});
export const registeredViewsServerAtom = atom<RegisteredViews>({});

export const mergeRegisteredViews = (
  rv1: RegisteredViews,
  rv2: RegisteredViews
) => {
  const xx = Object.keys(rv1).reduce((acc, key) => {
    const view1 = rv1[key];
    const view2 = rv2[key];

    if (view1?._generated && view2?._generated) {
      return {
        ...acc,
        [key]: view1,
      };
    }

    if (view1?._generated && view2) {
      return {
        ...acc,
        [key]: view2,
      };
    }

    if (view1 && view2?._generated) {
      return {
        ...acc,
        [key]: view1,
      };
    }

    return {
      ...acc,
      [key]: view2 ?? view1,
    };
  }, {} as RegisteredViews);

  return xx;
};
