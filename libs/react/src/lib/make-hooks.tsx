import {
  DataType,
  DataTypeToUse,
  // GetTableName,
  ViewConfigType,
} from '@apps-next/core';

import { useList } from './ui-adapter';
import { useQuery } from './use-query';
import { useQueryData } from './use-query-data';

// type GetTableName = RegisteredRouter['config']['tableNames'][number];

// type DataType<
//   T extends GetTableName = any,
//   TCustomDataType extends Record<string, any> | undefined = undefined
// > = TCustomDataType extends undefined
//   ? GetTableDataType<T>
//   : TCustomDataType & GetTableDataType<T>;

// type DataTypeToUse<T extends DataType<any, any>> = T extends ViewConfigType
//   ? GetTableDataType<T['tableName']>
//   : T;

export const makeHooks = <T extends DataType | ViewConfigType>(
  viewConfig?: T
) => {
  return {
    useList: useList<DataTypeToUse<T>>,
    useQuery: useQuery<DataTypeToUse<T>[]>,
    useQueryData: useQueryData<DataTypeToUse<T>[]>,
    xx: {} as DataTypeToUse<T>,
  };
};
