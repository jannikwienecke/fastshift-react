import { DetailPageProps, MakeDetailPropsOption } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { detailFormHelper } from './legend.detailpage.helper';
import { selectState$, xSelect } from './legend.select-state';
import { store$ } from './legend.store';

export const detailPageProps$ = observable<Partial<MakeDetailPropsOption>>({});

export const derviedDetailPage$ = observable(() => {
  if (!store$.detail.row.get()) return {} as DetailPageProps;

  const helper = detailFormHelper();

  return {
    row: helper.row,
    icon: helper.view.icon,
    formState: helper.formState,
    primitiveFields: helper.getPrimitiveFormFields(),
    propertyFields: helper.getPropertiesFields(),

    displayField: helper.displayField,
    type: store$.commandform.type.get() ?? 'create',
    viewName: store$.userViewData.name.get() ?? helper.view.viewName,
    tableName: helper.view.tableName,
    relationalListFields: helper.getRelationalFields(),
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

    onHoverRelationalListField: (field) => {
      store$.navigation.state.set({
        type: 'preload-relational-sub-list',
        state: { fieldName: field.field?.name ?? '' },
      });
    },

    onSelectView: (options) => {
      store$.detail.viewType.set(options);

      store$.navigation.state.set({
        type: 'switch-detail-view',
        state: options,
      });
    },
  } satisfies Omit<DetailPageProps, 'render'>;
});
