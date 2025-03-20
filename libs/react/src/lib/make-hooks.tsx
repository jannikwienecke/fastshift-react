import { DataType, DataTypeToUse, ViewConfigType } from '@apps-next/core';

import { makeComboboxProps, makeListProps } from './ui-adapter';
import { useQuery } from './use-query';
import { useQueryData } from './use-query-data';
import { makeFilterProps } from './ui-adapter/filter-adapter';
import { makeInputDialogProps } from './ui-adapter/input-dialog';
import { makeDisplayOptionsProps } from './ui-adapter/filter-adapter/displayOptions-adapter';
import { makeContextMenuProps } from './ui-adapter/filter-adapter/contextmenu-adapter';
import { makeConfirmationAlertProps } from './ui-adapter/confirmation-alert-adapter/confirmation-alert-adapter';
import { makeCommandbarProps } from './ui-adapter/commandbar-adapter';
import { makeDatePickerDialogProps } from './ui-adapter/adapter.datepickerdialog';

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
    makeContextmenuProps: makeContextMenuProps<DataTypeToUse<T>>,
    makeConfirmationAlertProps: makeConfirmationAlertProps<DataTypeToUse<T>>,
    makeCommandbarProps: makeCommandbarProps<DataTypeToUse<T>>,
    makeDatePickerDialogProps: makeDatePickerDialogProps<DataTypeToUse<T>>,
  };
};
