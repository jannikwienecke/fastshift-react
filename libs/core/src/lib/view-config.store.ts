import { atom } from 'jotai';
import { BaseViewConfigManagerInterface } from './base-view-config';

export const viewConfigManagerAtom =
  atom<BaseViewConfigManagerInterface | null>(null);

export const setViewConfigAtom = atom(
  null,
  (_, set, update: BaseViewConfigManagerInterface) => {
    set(viewConfigManagerAtom, update);
  }
);

export const getViewConfigAtom = atom((get) => {
  const viewConfigManager = get(viewConfigManagerAtom);
  if (!viewConfigManager) {
    throw new Error('View config manager not found');
  }
  return viewConfigManager;
});
