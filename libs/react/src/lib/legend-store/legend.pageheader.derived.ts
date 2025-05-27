import { MakePageHeaderPropsOption, PageHeaderProps, t } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { PencilIcon } from 'lucide-react';
import { derviedDetailPage$ } from './legend.detailpage.derived';
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
        if (option.command === 'create-new-view') {
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

    // TODO: MAKE THIS GENEERIC AND REUSABLE -> Like commands
    options: [
      {
        header: '',
        items: [
          {
            id: 'edit',
            label: t('common.edit') + '...',
            icon: PencilIcon,
            command: 'create-new-view',
          },
        ],
      },
    ],

    onToggleFavorite: async () => {
      const userViewData = store$.userViewData.get();
      if (!userViewData) return;

      store$.updateViewMutation({
        id: userViewData.id,
        starred: !userViewData.starred,
      });
    },

    onSelectOption: (option) => {
      if (option.command === 'create-new-view') {
        store$.userViewSettings.form.set({
          type: 'edit',
          viewName: userView$.get()?.name ?? currentView$.viewName.get(),
          viewDescription: userView$.get()?.description ?? '',
          emoji: userView$.get()?.emoji,
          iconName: undefined,
        });
      }
    },
  } satisfies PageHeaderProps;
});
