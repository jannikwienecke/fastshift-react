import {
  BaseViewConfigManagerInterface,
  DataModelNew,
  RegisteredViews,
  RelationalDataModel,
} from '@apps-next/core';
import { LegendStore } from './legend.store.types';

export const DEFAULT_LEGEND_STORE: Pick<
  LegendStore,
  'dataModel' | 'views' | 'viewConfigManager' | 'list' | 'relationalDataModel'
> = {
  dataModel: {} as DataModelNew,
  views: {} as RegisteredViews,
  viewConfigManager: {} as BaseViewConfigManagerInterface,
  relationalDataModel: {} as RelationalDataModel,

  list: {
    selected: [],
  },
};
