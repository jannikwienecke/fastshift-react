import { detailFormHelper } from './legend.detailpage.helper';
import { detailTabsHelper } from './legend.detailtabs.helper';
import { StoreFn } from './legend.store.types';

export const detailpageChangeInput: StoreFn<'detailpageChangeInput'> =
  (store$) => (fieldItem, value, isTabField) => {
    const tabField = store$.detail.activeTabField.get();

    if (tabField && isTabField && fieldItem.field) {
      detailTabsHelper()?.updateRow(fieldItem.field, value);
      store$.detail.useTabsFormField.set(true);
    } else {
      store$.detail.useTabsFormField.set(false);
      const helper = detailFormHelper();
      const field = fieldItem.field;
      if (!field) return;

      helper.updateRow(field, value);
    }
  };

export const detailpageBlurInput: StoreFn<'detailpageBlurInput'> =
  (store$) => (fieldItem, isTabField) => {
    const tabField = store$.detail.activeTabField.get();

    if (tabField && isTabField && fieldItem.field) {
      store$.detail.useTabsFormField.set(true);
      detailTabsHelper()?.saveIfDirty(fieldItem.field);
    } else {
      store$.detail.useTabsFormField.set(false);
      const helper = detailFormHelper();
      const field = fieldItem.field;
      if (!field) return;

      helper.saveIfDirty(field);
    }
  };

export const detailpageEnter: StoreFn<'detailpageEnter'> =
  (store$) => (fieldItem, isTabField) => {
    store$.detailpageBlurInput(fieldItem, isTabField);
  };
