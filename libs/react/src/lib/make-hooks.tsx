import { DataType, DataTypeToUse, ViewConfigType } from '@apps-next/core';

import { makeComboboxProps, makeListProps } from './ui-adapter';
import { useQuery } from './use-query';
import { useQueryData } from './use-query-data';
import { makeFilterProps } from './ui-adapter/filter-adapter';
import { makeInputDialogProps } from './ui-adapter/input-dialog';
import { makeDisplayOptionsProps } from './ui-adapter/filter-adapter/displayOptions-adapter';

export const makeHooks = <T extends DataType | ViewConfigType>(
  viewConfig?: T
) => {
  return {
    useQuery: useQuery<DataTypeToUse<T>[]>,
    useQueryData: useQueryData<DataTypeToUse<T>[]>,
    makeFilterProps: makeFilterProps<DataTypeToUse<T>>,
    makeDisplayOptionsProps: makeDisplayOptionsProps<DataTypeToUse<T>>,
    makeInputDialogProps: makeInputDialogProps<DataTypeToUse<T>>,
    makeComboboxProps: makeComboboxProps<DataTypeToUse<T>>,
    makeListProps: makeListProps<DataTypeToUse<T>>,
  };
};
