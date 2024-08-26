import { registeredViewsAtom, viewConfigManagerAtom } from '@apps-next/core';
import { useAtomValue } from 'jotai';

export const useView = () => {
  const viewConfigManager = useAtomValue(viewConfigManagerAtom);
  const registeredViews = useAtomValue(registeredViewsAtom);

  if (!viewConfigManager) throw new Error('View Config Manager not found');

  return { viewConfigManager, registeredViews };
};
