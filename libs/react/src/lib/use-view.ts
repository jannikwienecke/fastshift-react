import {
  BaseViewConfigManagerInterface,
  GetTableName,
  RegisteredViews,
  ViewConfigType,
} from '@apps-next/core';
import { store$ } from './legend-store/legend.store';

export const useView = () => {
  const viewConfigManager =
    store$.viewConfigManager.get() as BaseViewConfigManagerInterface;

  const registeredViews = store$.views.get() as RegisteredViews;

  if (!viewConfigManager) throw new Error('View Config Manager not found');

  return { viewConfigManager, registeredViews };
};

export const useViewOf = (tableName: GetTableName) => {
  const { registeredViews } = useView();

  const view = Object.values(registeredViews).find(
    (v) => v?.tableName === tableName
  );

  if (!view) throw new Error(`No View For "${tableName.toString()}" found`);
  return view as ViewConfigType;
};
