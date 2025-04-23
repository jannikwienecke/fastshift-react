import {
  BaseViewConfigManagerInterface,
  makeData,
  QueryReturnOrUndefined,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { selectState$ } from './legend.select-state';
import { queryListViewOptions$ } from './legend.queryProps.derived';

export const copyRow = (
  row: Row,
  viewConfigManager?: BaseViewConfigManagerInterface
): Row => {
  return makeData(
    store$.views.get(),
    viewConfigManager?.getViewName() ?? store$.viewConfigManager.getViewName()
  )([{ ...row.raw }]).rows?.[0] as Row;
};

export const _hasOpenDialog$ = observable(() => {
  const commandbarIsOpen = store$.commandbar.open.get();
  const commandformIsOpen = store$.commandform.open.get();
  const contextmenuIsOpen = store$.contextMenuState.rect.get() !== null;
  const filterIsOpen = store$.filter.open.get();
  const displayOptionsIsOpen = store$.displayOptions.isOpen.get();

  return (
    commandbarIsOpen ||
    commandformIsOpen ||
    contextmenuIsOpen ||
    filterIsOpen ||
    displayOptionsIsOpen
  );
});

export const hasOpenDialog$ = observable(false);

export const isDetail = () => {
  const viewConfigDetail = store$.detail.viewConfigManager.get();
  const detailForm = store$.detail.form.dirtyValue.get();
  const selectStateIsDetail = selectState$.isDetail.get();

  return !!((detailForm || selectStateIsDetail) && viewConfigDetail);
};

export const getViewConfigManager = (): BaseViewConfigManagerInterface => {
  if (isDetail()) {
    const viewConfigDetail = store$.detail.viewConfigManager.get();

    return viewConfigDetail as BaseViewConfigManagerInterface;
  }

  return store$.viewConfigManager.get();
};

export const isDetailOverview = () => {
  return store$.detail.viewType.type.get() === 'overview';
};
