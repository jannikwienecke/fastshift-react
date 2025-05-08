import { MakePageHeaderPropsOption, PageHeaderProps } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { viewRegistry } from './legend.app.registry';
import { currentView$ } from './legend.shared.derived';

export const pageHeaderProps$ = observable<Partial<MakePageHeaderPropsOption>>(
  {}
);

export const derivedPageHeaderProps$ = observable(() => {
  const view = viewRegistry.getView(
    store$.viewConfigManager.getViewName()
  ).viewConfig;

  return {
    viewName:
      store$.userViewData.name.get() ?? store$.viewConfigManager.getViewName(),
    icon: view?.icon,
    starred: store$.userViewData.starred.get() ?? false,
    onToggleFavorite: async () => {
      const userViewData = store$.userViewData.get();
      if (!userViewData) return;

      store$.updateViewMutation({
        starred: !userViewData.starred,
      });
    },
  } satisfies PageHeaderProps;
});
