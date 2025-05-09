import { MakePageHeaderPropsOption, PageHeaderProps, t } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { PencilIcon } from 'lucide-react';
import {
  currentView$,
  detailLabel$,
  detailUserView$,
  detailView$,
  parentUserView$,
  parentView$,
  parentViewName$,
  userView$,
} from './legend.shared.derived';
import { store$ } from './legend.store';
import { derviedDetailPage$ } from './legend.detailpage.derived';

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
      viewName: parentViewName$.get() ?? '',
      detail: {
        label: detailLabel$.get(),
        onClickParentView: () => {
          store$.navigation.set({
            state: {
              view: parentUserView$.get()?.name ?? '',
              slug: parentUserView$.get()?.slug ?? '',
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
    viewName:
      store$.userViewData.name.get() ??
      currentView$.viewName.get().firstUpper() ??
      '',
    icon: currentView$.get().icon,
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
        starred: !userViewData.starred,
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
  } satisfies PageHeaderProps;
});
