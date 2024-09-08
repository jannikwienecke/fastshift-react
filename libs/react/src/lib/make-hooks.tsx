import { DataType, DataTypeToUse, ViewConfigType } from '@apps-next/core';

import { useList } from './ui-adapter';
import { useQuery } from './use-query';
import { useQueryData } from './use-query-data';

export const makeHooks = <T extends DataType | ViewConfigType>(
  viewConfig?: T
) => {
  return {
    useList: useList<DataTypeToUse<T>>,
    useQuery: useQuery<DataTypeToUse<T>[]>,
    useQueryData: useQueryData<DataTypeToUse<T>[]>,
  };
};
