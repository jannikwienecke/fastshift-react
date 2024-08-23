import { atom } from 'jotai';
import { BaseConfigInterface } from './types';

export const globalConfigAtom = atom<BaseConfigInterface>(
  {} as BaseConfigInterface
);

export const setGlobalConfigAtom = atom(
  null,
  (_, set, update: BaseConfigInterface) => {
    set(globalConfigAtom, update);
  }
);
