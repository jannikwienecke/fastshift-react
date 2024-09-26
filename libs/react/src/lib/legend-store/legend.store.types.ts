import {
  BaseViewConfigManagerInterface,
  DataModelNew,
  QueryRelationalData,
  RecordType,
  RegisteredViews,
  RelationalDataModel,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';

export type LegendStore = {
  // MAIN DATA MODEL
  dataModel: DataModelNew;
  relationalDataModel: RelationalDataModel;

  //   VIEW STATE
  viewConfigManager: BaseViewConfigManagerInterface;
  views: RegisteredViews;

  //   list state
  list: {
    selected: RecordType[];
  };

  //   METHODS
  init: (
    data: RecordType[],
    relationalData: QueryRelationalData,
    viewConfigManager: BaseViewConfigManagerInterface,
    views: RegisteredViews
  ) => void;

  createDataModel: (data: RecordType[]) => void;
  createRelationalDataModel: (data: QueryRelationalData) => void;

  //   list methods
  selectListItem: (record: RecordType) => void;
};

export type StoreFn<T extends keyof LegendStore> = (
  store$: Observable<LegendStore>
) => LegendStore[T];
