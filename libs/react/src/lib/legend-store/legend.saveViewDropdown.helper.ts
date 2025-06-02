import { slugHelper, UserViewData } from '@apps-next/core';
import { userView$ } from './legend.shared.derived';
import { store$ } from './legend.store';

export const updateExisitingView = () => {
  const form = store$.userViewSettings.form.get();
  const queryKey = store$.api.getUserViewQueryKey.get();

  if (!form) {
    throw new Error('Form is not set.');
  }

  if (!queryKey) {
    throw new Error('Query key is not set.');
  }

  store$.api.queryClient.setQueryData(queryKey, (oldData: UserViewData[]) => {
    const mapped = oldData
      .map((view) => {
        if (view.id === userView$.get()?.id && !view._deleted) {
          return [
            {
              ...view,
              id: view.id,
              _deleted: true,
            },
            {
              ...view,
              name: form.viewName,
              description: form.viewDescription,
              emoji: form.emoji,
              slug: slugHelper().slugify(form.viewName),
            },
          ];
        }

        return view;
      })
      .flat();

    return mapped;
  });

  const queryData = store$.api.queryClient.getQueryData(
    queryKey
  ) as UserViewData[];

  return {
    queryKey,
    queryData,
  };
};
