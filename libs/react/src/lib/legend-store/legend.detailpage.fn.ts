import { detailFormHelper } from './legend.detailpage.helper';
import { StoreFn } from './legend.store.types';

export const detailpageChangeInput: StoreFn<'detailpageChangeInput'> =
  (store$) => (fieldItem, value) => {
    const helper = detailFormHelper();
    const field = fieldItem.field;
    if (!field) return;

    helper.updateRow(field, value);
  };

export const detailpageBlurInput: StoreFn<'detailpageBlurInput'> =
  (store$) => (fieldItem) => {
    const helper = detailFormHelper();
    const field = fieldItem.field;
    if (!field) return;

    helper.saveIfDirty(field);
  };

export const detailpageEnter: StoreFn<'detailpageEnter'> =
  (store$) => (fieldItem) => {
    const helper = detailFormHelper();
    const field = fieldItem.field;
    if (!field) return;

    helper.saveIfDirty(field);
  };
