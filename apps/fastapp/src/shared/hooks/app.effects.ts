import { _log, slugHelper } from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { useRouteContext, useRouter } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../../application-store/app.store.utils';
import { useViewParams } from './useViewParams';

export const useAppEffects = (viewName: string) => {
  const { viewData } = getViewData(viewName);
  const activeViewConfig = viewData.viewConfig;

  const router = useRouter();
  const { preloadQuery } = useRouteContext({ from: '/fastApp/$view' });

  const navigateRef = React.useRef(router.navigate);
  const preloadRef = React.useRef(preloadQuery);

  const { id, slug } = useViewParams();

  const preloadRoute = React.useCallback(
    (id: string) => {
      preloadRef.current(
        activeViewConfig,
        activeViewConfig.viewName,
        id,
        null,
        null
      );
    },
    [activeViewConfig]
  );

  React.useEffect(() => {
    store$.userViewSettings.viewCreated.slug.onChange((v) => {
      const slug = v.value;
      if (slug) {
        navigateRef.current({ to: `/fastApp/${slug}` });
      }
    });

    store$.list.rowInFocus.onChange((changes) => {
      const row = changes.value;

      if (row?.row?.id) {
        _log.debug('Preload row', row.row.id);
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

        case 'switch-detail-view':
          (() => {
            const model = state.model;
            if (model && id) {
              navigateRef.current({
                to: `/fastApp/$view/$id/$model`,
                params: {
                  id,
                  view: slug,
                  model,
                },
              });
            } else if (id) {
              navigateRef.current({
                to: '/fastApp/$view/$id/overview',
                params: {
                  id,
                  view: slug,
                },
              });
            }
          })();

          break;

        default:
          break;
      }
    });
  }, [id, preloadRoute, slug, viewName]);
};
