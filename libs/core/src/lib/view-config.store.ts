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
