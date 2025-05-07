import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  getViewByName,
  makeData,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { derviedDetailPage$ } from './legend.detailpage.derived';
import { selectState$ } from './legend.select-state';
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

export const isDetail = () => {
  const viewConfigDetail = store$.detail.viewConfigManager.get();
  const detailForm = store$.detail.form.dirtyValue.get();
  const selectStateIsDetail = selectState$.isDetail.get();
  const isDetailOverview = store$.detail.viewType.type.get() === 'overview';

  return !!(
    (detailForm || selectStateIsDetail || isDetailOverview) &&
    viewConfigDetail
  );
};

export const isTabs = () => {
  const useTabs = store$.detail.useTabsForComboboxQuery.get();
  const useTabsFormField = store$.detail.useTabsFormField.get();

  return !!useTabs || !!useTabsFormField;
};

export const getViewConfigManager = (): BaseViewConfigManagerInterface => {
  const activeTabField = derviedDetailPage$.tabs.activeTabField.get();
  if (isTabs() && activeTabField) {
    const activeTabViewName = getViewByName(
      store$.views.get(),
      activeTabField?.field?.name ?? ''
    );
    if (!activeTabViewName) throw new Error('No active tab view name found');

    return new BaseViewConfigManager(
      activeTabViewName
    ) as BaseViewConfigManagerInterface;
  }
  if (isDetail()) {
    const viewConfigDetail = store$.detail.viewConfigManager.get();

    return viewConfigDetail as BaseViewConfigManagerInterface;
  }

  return store$.viewConfigManager.get();
};

export const isDetailOverview = () => {
  return store$.detail.viewType.type.get() === 'overview';
};
