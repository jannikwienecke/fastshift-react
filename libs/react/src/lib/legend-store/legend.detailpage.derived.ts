import { DetailPageProps, MakeDetailPropsOption, Row } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { detailFormHelper } from './legend.detailpage.helper';
import { detailTabsHelper } from './legend.detailtabs.helper';
import { selectState$, xSelect } from './legend.select-state';
import { detailUserView$ } from './legend.shared.derived';
import { store$ } from './legend.store';
import { perstistedStore$ } from './legend.store.persisted';
import { getCommandGroups, getPrimaryCommand } from '../commands';
import { getCommandsDropdownProps } from './legend.utils.helper';

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
    emoji: detailUserView$.get()?.emoji ?? null,
    tabs: tabsProps
      ? {
          ...tabsProps,
          isHistoryTab: perstistedStore$.isActivityTab.get(),
          historyData: store$.detail.historyDataOfRow.get() ?? [],
          onSelectHistoryTab: () => {
            perstistedStore$.isActivityTab.set(true);
          },
          onSelectTab(field) {
            perstistedStore$.isActivityTab.set(false);
            store$.detail.activeTabField.set(field);
            perstistedStore$.activeTabFieldName.set(field.field?.name);
          },
          onClickGoToRelation: () => {
            const tab = store$.detail.activeTabField.get();
            if (!tab?.field?.name || !tab.rowValue) return;

            store$.navigation.state.set({
              type: 'navigate',
              id: tab?.rowValue.id,
              view: tab.field.name,
            });
          },
        }
      : null,

    commands: {
      primaryCommand: getPrimaryCommand(),
      commandsDropdownProps: getCommandsDropdownProps({
        view: 'detail-row',
        commands: getCommandGroups(),
      }),
    },

    onClick: (field, rect, tabFormField) => {
      if (store$.detail.onClickRelation.get() && field.field) {
        store$.detail.onClickRelation
          .get()
          ?.fn?.(field.field, store$.detail.row.get() as Row, () => null);
        return;
      }

      if (tabFormField && field.field && tabsProps?.row) {
        store$.detail.useTabsForComboboxQuery.set(true);
        xSelect.open(tabsProps?.row, field.field, true);
        selectState$.rect.set(rect);
      } else if (field.field) {
        selectState$.isDetail.set(true);
        xSelect.open(detailHelper.row, field.field, true);
        selectState$.rect.set(rect);
      }
    },
    onClickGoToRelation: (field, tabFormField) => {
      // TODO Abstract this function to a helper
      store$.navigation.state.assign({
        type: 'navigate',
        id: tabFormField.id,
        view: field.field?.name,
      });
    },
    onSelectEmoji(emoji) {
      store$.updateDetailViewMutation({
        emoji,
      });
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
