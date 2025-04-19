import { slugHelper, UserViewForm } from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { useRouteContext, useRouter } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../../application-store/app.store.utils';

export const useAppEffects = (viewName: string) => {
  const { viewData } = getViewData(viewName);
  const activeViewConfig = viewData.viewConfig;

  const router = useRouter();
  const { preloadQuery } = useRouteContext({ from: '/fastApp/$view' });

  const navigateRef = React.useRef(router.navigate);
  const preloadRef = React.useRef(preloadQuery);

  const preloadRoute = React.useCallback(
    (id: string) => {
      preloadRef.current(activeViewConfig, activeViewConfig.viewName, id);
    },
    [activeViewConfig]
  );

  React.useEffect(() => {
    store$.userViewSettings.viewCreated.slug.onChange((v) => {
      const slug = v.value;
      if (slug) {
        const name = slugHelper().unslugify(slug);
        navigateRef.current({ to: `/fastApp/${slug}` });
      }
    });

    store$.list.rowInFocus.onChange((changes) => {
      const row = changes.value;

      if (row?.row?.id) {
        preloadRoute(row.row.id);
      }
    });

    store$.navigation.state.onChange((changes) => {
      const state = changes.value;

      switch (state?.type) {
        case 'navigate':
          (() => {
            const id = state.id;
            if (id) {
              navigateRef.current({
                to: `/fastApp/${slugHelper().slugify(state.view)}/${id}`,
              });
            }
          })();

          break;

        default:
          break;
      }
    });
  }, [preloadRoute, viewName]);
};
