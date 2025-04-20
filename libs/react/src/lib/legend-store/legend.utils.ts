import { BaseViewConfigManagerInterface, makeData, Row } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

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

export const getViewConfigManager = (): BaseViewConfigManagerInterface => {
  const viewConfigDetail = store$.detail.viewConfigManager.get();
  const detailForm = store$.detail.form.dirtyValue.get();

  if (!detailForm || !viewConfigDetail) {
    return store$.viewConfigManager.get();
  }

  return viewConfigDetail as BaseViewConfigManagerInterface;
};
