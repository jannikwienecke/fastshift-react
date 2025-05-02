import { DetailPageProps, MakeDetailPropsOption } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { detailFormHelper } from './legend.detailpage.helper';
import { selectState$, xSelect } from './legend.select-state';
import { store$ } from './legend.store';
import { detailTabsHelper } from './legend.detailtabs.helper';

export const detailPageProps$ = observable<Partial<MakeDetailPropsOption>>({});

export const derviedDetailPage$ = observable(() => {
  if (!store$.detail.row.get()) {
    return {} as DetailPageProps;
  }

  const detailHelper = detailFormHelper();
  const tabsProps = detailTabsHelper();

  return {
    row: detailHelper.row,
    icon: detailHelper.view.icon,
    formState: detailHelper.formState,
    primitiveFields: detailHelper.getPrimitiveFormFields(),
    propertyFields: detailHelper.getPropertiesFields(),

    displayField: detailHelper.displayField,
    type: store$.commandform.type.get() ?? 'create',
    viewName:
      store$.detail.parentViewName.get() ??
      store$.userViewData.name.get() ??
      detailHelper.view.viewName,
    tableName: detailHelper.view.tableName,
    relationalListFields: detailHelper.getRelationalFields(),
    currentRelationalListField: null,
    viewTypeState: store$.detail.viewType.get() ?? { type: 'overview' },

    tabs: tabsProps
      ? {
          ...tabsProps,
          onSelectTab(field) {
            store$.detail.activeTabField.set(field);
          },
        }
      : null,
    onClick: (field, rect, tabFormField) => {
      if (tabFormField && field.field && tabsProps?.row) {
        store$.detail.useTabsForComboboxQuery.set(true);
        xSelect.open(tabsProps?.row, field.field, true);
        selectState$.rect.set(rect);
      } else if (field.field) {
        xSelect.open(detailHelper.row, field.field, true);
        selectState$.rect.set(rect);
      }
    },
    onInputChange(...props) {
      store$.detailpageChangeInput(...props);
    },
    onBlurInput(...props) {
      store$.detailpageBlurInput(...props);
    },
    onCheckedChange: (...props) => {
      store$.commandformChangeInput(...props);
    },
    onSubmit: () => store$.commandformSubmit(),

    onEnter: (...props) => store$.detailpageEnter(...props),

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
