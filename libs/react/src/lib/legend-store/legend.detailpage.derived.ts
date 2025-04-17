import { DetailPageProps, MakeDetailPropsOption } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { detailFormHelper } from './legend.detailpage.helper';
import {
  getComplexFormFields,
  getErrorListFromFormState,
  getFormState,
} from './legend.form.helper';
import { store$ } from './legend.store';
import { copyRow } from './legend.utils';
import { selectState$, xSelect } from './legend.select-state';

export const detailPageProps$ = observable<Partial<MakeDetailPropsOption>>({});

detailPageProps$.onChange((changes) => {
  const props = changes.value;
  if (!props.row) return;

  store$.detail.row.set(copyRow(props.row));
  store$.detail.form.set({});
});

export const derviedDetailPage$ = observable(() => {
  const helper = detailFormHelper();

  return {
    ...(store$.commandform.get() ?? {}),

    row: helper.row,
    icon: helper.view.icon,
    formState: helper.formState,
    primitiveFields: helper.getPrimitiveFormFields(),
    complexFields: helper.getComplexFormFields(),
    displayField: helper.displayField,
    type: store$.commandform.type.get() ?? 'create',
    viewName: helper.view.viewName,
    tableName: helper.view.tableName,

    onClick: (field, rect: DOMRect) => {
      if (field.field) {
        xSelect.open(helper.row, field.field);
        selectState$.rect.set(rect);
      }
    },
    onInputChange(field, value) {
      store$.detailpageChangeInput(field, value);
    },
    onBlurInput(field) {
      store$.detailpageBlurInput(field);
    },
    onCheckedChange: (field, value) => {
      store$.commandformChangeInput(field, value);
    },
    onSubmit: () => store$.commandformSubmit(),

    onEnter: (field) => store$.detailpageEnter(field),
  } satisfies Omit<DetailPageProps, 'render'>;
});
