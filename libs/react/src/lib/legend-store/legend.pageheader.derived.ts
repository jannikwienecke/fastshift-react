import { MakePageHeaderPropsOption, PageHeaderProps } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { getCommandGroups } from '../commands/commands.get';
import { derviedDetailPage$ } from './legend.detailpage.derived';
import { hasRightSidebarFiltering } from './legend.rightsidebar.state';
import {
  currentView$,
  detailLabel$,
  detailUserView$,
  parentUserView$,
  parentView$,
  parentViewName$,
  userView$,
} from './legend.shared.derived';
import { store$ } from './legend.store';

export const pageHeaderProps$ = observable<Partial<MakePageHeaderPropsOption>>(
  {}
);

export const derivedPageHeaderProps$ = observable(() => {
  const detailProps = derviedDetailPage$.get();

  if (store$.detail.row.get()) {
    return {
      options: [],
      starred: detailUserView$.get()?.starred ?? false,
      icon: parentView$.get()?.icon,
      emoji: parentUserView$.get()?.emoji,
      viewName: parentViewName$.get() ?? '',
      onOpenCommands: () => {
        store$.commandsDialog.type.set('detail-row');
      },
      detail: {
        label: detailLabel$.get(),
        onClickParentView: () => {
          store$.navigation.set({
            state: {
              view:
                parentUserView$.get()?.name ??
                parentView$.get()?.viewName ??
                '',
              slug:
                parentUserView$.get()?.slug ??
                parentView$.get()?.viewName ??
                '',
              id: undefined,
              type: 'navigate',
            },
          });
        },
        ...detailProps,
      },

      onToggleFavorite: async () => {
        const userViewData = detailUserView$.get();

        store$.updateDetailViewMutation({
          starred: !userViewData ? true : !userViewData.starred,
        });
      },

      onSelectOption: (option) => {
        if (option.command === 'view-commands') {
          store$.userViewSettings.form.set({
            type: 'edit',
            viewName: userView$.get()?.name ?? '',
            viewDescription: userView$.get()?.description ?? '',
            iconName: undefined,
          });
        }
      },
    } as PageHeaderProps;
  }

  return {
    query: {
      onChange: (query) => {
        store$.viewQuery.set(query);
      },
      toggleShowInput: () => {
        store$.pageHeader.showSearchInput.set((prev) => !prev);
      },
      onBlur: () => {
        if (store$.viewQuery.get() === '') {
          store$.pageHeader.showSearchInput.set(false);
        }
      },
      onToggleRightSidebar: hasRightSidebarFiltering()
        ? () => {
            store$.rightSidebar.open.set((prev) => !prev);
          }
        : undefined,
      showInput: store$.pageHeader.showSearchInput.get(),
      query: store$.viewQuery.get(),
    },
    viewName:
      store$.userViewData.name.get() ??
      currentView$.viewName.get().firstUpper() ??
      '',
    icon: currentView$.get().icon,
    emoji: userView$.get()?.emoji,
    starred: store$.userViewData.starred.get() ?? false,

    options: getCommandGroups().filter((g) =>
      g.items.find((i) => i.command === 'view-commands')
    ),

    onToggleFavorite: async () => {
      const userViewData = store$.userViewData.get();
      if (!userViewData) return;

      store$.updateViewMutation({
        id: userViewData.id,
        starred: !userViewData.starred,
      });
    },

    onOpenCommands: () => {
      store$.commandsDialog.type.set('view');
    },

    onSelectOption: (option) => {
      option.handler?.({ row: undefined, field: undefined, value: option });
    },
  } satisfies PageHeaderProps;
});
