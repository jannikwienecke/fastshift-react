import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
  getViewByName,
  makeData,
  Row,
  ViewConfigType,
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
  const selectStateIsOpen = selectState$.parentRow.get() !== null;
  const displayOptionsIsOpen = store$.displayOptions.isOpen.get();

  return (
    commandbarIsOpen ||
    commandformIsOpen ||
    contextmenuIsOpen ||
    filterIsOpen ||
    selectStateIsOpen ||
    displayOptionsIsOpen
  );
});

export const hasOpenDialog$ = observable(false);

export const isDetail = () => {
  const viewConfigDetail = store$.detail.viewConfigManager.get();
  const detailForm = store$.detail.form.dirtyValue.get();
  const selectStateIsDetail = selectState$.isDetail.get();
  const isDetailOverview = store$.detail.viewType.type.get() === 'overview';

  const commandformView = store$.commandform.view.viewName.get();
  const commandViewIsDetail = !commandformView
    ? true
    : commandformView === viewConfigDetail?.getViewName?.();

  return !!(
    (detailForm || selectStateIsDetail || isDetailOverview) &&
    viewConfigDetail &&
    commandViewIsDetail
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

export const getIsManyRelationView = (tableOrFieldName: string) => {
  const detailViewConfigFields =
    store$.detail.viewConfigManager.viewConfig.viewFields.get();

  const viewThatHasAManyRelation = Object.values(
    detailViewConfigFields ?? {}
  ).find(
    (f) =>
      f.name === tableOrFieldName &&
      (f.isList || f.relation?.type === 'manyToMany')
  );

  return viewThatHasAManyRelation;
};

export const getSubUserView = (subConfig: ViewConfigType) => {
  const viewConfigParent = store$.detail.viewConfigManager.viewConfig.get();
  if (!viewConfigParent) return null;

  const userViews = store$.userViews.get();

  const name = `${viewConfigParent.tableName}|${subConfig.tableName}`;

  return userViews.find((v) => v.name === name);
};

export const createSubViewName = (
  parentView: ViewConfigType,
  subView: ViewConfigType
) => {
  const name = `${parentView.tableName}|${subView.tableName}`;

  return name;
};
