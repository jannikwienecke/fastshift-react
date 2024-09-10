import { ViewConfigType } from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { registeredViewsAtom, viewConfigManagerAtom } from './stores';

export const useView = () => {
  const viewConfigManager = useAtomValue(viewConfigManagerAtom);
  const registeredViews = useAtomValue(registeredViewsAtom);

  if (!viewConfigManager) throw new Error('View Config Manager not found');

  return { viewConfigManager, registeredViews };
};

export const useViewOf = (tableName: string) => {
  const { registeredViews } = useView();

  const view = Object.values(registeredViews).find(
    (v) => v?.tableName === tableName
  );

  if (!view) throw new Error(`No View For ${tableName} found`);
  return view as ViewConfigType;
};
