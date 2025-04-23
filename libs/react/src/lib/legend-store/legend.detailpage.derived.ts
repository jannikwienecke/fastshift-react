import { DetailPageProps, MakeDetailPropsOption } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { detailFormHelper } from './legend.detailpage.helper';
import { selectState$, xSelect } from './legend.select-state';
import { store$ } from './legend.store';

export const detailPageProps$ = observable<Partial<MakeDetailPropsOption>>({});

// detailPageProps$.onChange((changes) => {
//   const props = changes.value;
//   console.log(changes);

//   if (!props.row) return;

//   const viewConfigManager =
//     store$.detail.viewConfigManager.get() as BaseViewConfigManagerInterface;

//   if (!viewConfigManager.viewConfig) return;

//   store$.detail.row.set(copyRow(props.row, viewConfigManager));
//   store$.detail.form.set({});
// });

export const derviedDetailPage$ = observable(() => {
  if (!store$.detail.row.get()) return {} as DetailPageProps;

  const helper = detailFormHelper();

  const relationalListFields =
    helper
      .getComplexFormFields()
      .filter((f) => f.field.relation?.manyToManyModelFields?.length) ?? [];

  console.log(store$.detail.viewType.get());
  return {
    row: helper.row,
    icon: helper.view.icon,
    formState: helper.formState,
    primitiveFields: helper.getPrimitiveFormFields(),
    complexFields: helper.getComplexFormFields(),

    displayField: helper.displayField,
    type: store$.commandform.type.get() ?? 'create',
    viewName: store$.userViewData.name.get() ?? helper.view.viewName,
    tableName: helper.view.tableName,
    relationalListFields,
    currentRelationalListField: null,
    viewTypeState: store$.detail.viewType.get() ?? { type: 'overview' },
    onClick: (field, rect: DOMRect) => {
      if (field.field) {
        xSelect.open(helper.row, field.field, true);
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
    onSelectView: (options) => {
      store$.detail.viewType.set(options);

      store$.navigation.state.set({
        type: 'switch-detail-view',
        state: options,
      });
    },
  } satisfies Omit<DetailPageProps, 'render'>;
});
