import { DataType, DataTypeToUse, ViewConfigType } from '@apps-next/core';

import { makeComboboxProps, makeListProps } from './ui-adapter';
import { useQuery } from './use-query';
import { useQueryData } from './use-query-data';
import { makeFilterProps } from './ui-adapter/filter-adapter';
import { makeInputDialogProps } from './ui-adapter/input-dialog';
import { makeDisplayOptionsProps } from './legend-store/legend.displayOptions.adapter';
import { makeContextMenuProps } from './ui-adapter/filter-adapter/contextmenu-adapter';
import { makeConfirmationAlertProps } from './ui-adapter/confirmation-alert-adapter/confirmation-alert-adapter';
import { makeCommandbarProps } from './ui-adapter/commandbar-adapter';
import { makeDatePickerDialogProps } from './ui-adapter/adapter.datepickerdialog';
import { makeCommandformProps } from './ui-adapter/commandform-adapter';
import { makeDetailPageProps } from './legend-store/legend.detail.adapter';
import { makePageHeaderProps } from './legend-store/legend.pageheader.adapter';
import { makeSaveViewDropdownProps } from './legend-store/legend.saveViewDropdown.adapter';
import { makeRightSidebarProps } from './legend-store/legend.rightsidebar.adapter';

export const makeHooks = <T extends DataType | ViewConfigType>(
  viewConfig?: T
) => {
  return {
    useQuery: useQuery<DataTypeToUse<T>[]>,
    useQueryData: useQueryData<DataTypeToUse<T>>,
    makeFilterProps: makeFilterProps<DataTypeToUse<T>>,
    makeDisplayOptionsProps: makeDisplayOptionsProps<DataTypeToUse<T>>,
    makeInputDialogProps: makeInputDialogProps<DataTypeToUse<T>>,
    makeComboboxProps: makeComboboxProps<DataTypeToUse<T>>,
    makeListProps: makeListProps<DataTypeToUse<T>>,
    makeContextmenuProps: makeContextMenuProps<DataTypeToUse<T>>,
    makeConfirmationAlertProps: makeConfirmationAlertProps<DataTypeToUse<T>>,
    makeCommandbarProps: makeCommandbarProps<DataTypeToUse<T>>,
    makeCommandformProps: makeCommandformProps<DataTypeToUse<T>>,
    makeDatePickerDialogProps: makeDatePickerDialogProps<DataTypeToUse<T>>,
    makeSaveViewDropdownProps: makeSaveViewDropdownProps<DataTypeToUse<T>>,
    makeDetailPageProps: makeDetailPageProps<DataTypeToUse<T>>,
    makePageHeaderProps: makePageHeaderProps<DataTypeToUse<T>>,
    makeRightSidebarProps: makeRightSidebarProps<DataTypeToUse<T>>,
  };
};
