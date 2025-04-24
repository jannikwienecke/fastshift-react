import { _log, slugHelper } from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { useLocation, useRouter } from '@tanstack/react-router';
import React from 'react';
import { useViewParams } from './useViewParams';
import { getUserViews } from '../../query-client';

export const useAppEffects = (viewName: string) => {
  const router = useRouter();

  const navigateRef = React.useRef(router.navigate);
  const realPreloadRoute = router.preloadRoute;

  const { id, slug } = useViewParams();
  const { pathname } = useLocation();

  const view = store$.viewConfigManager.viewConfig.viewName.get();

  React.useEffect(() => {
    const isOverview = pathname.includes('/overview');
    if (!isOverview) return;

    const config = store$.viewConfigManager.viewConfig.get();
    const parentViewName = store$.detail.parentViewName.get();
    const parentId = store$.detail.row.get()?.id ?? null;

    if (!config || !parentViewName || !parentId) return;
    if (view.toLowerCase() === parentViewName.toLowerCase()) return;

    console.warn('____PRELOAD ROUTE INIT');
    realPreloadRoute({
      from: '/fastApp/$view/$id/overview',
      to: `/fastApp/${slugHelper().slugify(
        parentViewName
      )}/${parentId}/${view}`,
    });
  }, [pathname, realPreloadRoute, view]);

  React.useLayoutEffect(() => {
    store$.userViewSettings.viewCreated.slug.onChange(async (v) => {
      const views = getUserViews();

      store$.userViews.set(views);

      const slug = v.value;
      if (slug) {
        await realPreloadRoute({
          from: '/fastApp/$view',
          to: `/fastApp/${slug}`,
        });

        navigateRef.current({ to: `/fastApp/${slug}` });
      }
    });

    store$.list.rowInFocus.onChange((changes) => {
      const row = changes.value;

      if (row?.row?.id) {
        _log.debug('Preload row', row.row.id);
        realPreloadRoute({
          from: '/fastApp/$view',
          to: `/fastApp/$view/${row.row.id}/overview`,
        });
      }
    });

    store$.navigation.state.onChange((changes) => {
      const state = changes.value;

      switch (state?.type) {
        case 'preload-relational-sub-list':
          (() => {
            const fieldName = state.state.fieldName;
            const row = store$.detail.row.get();
            const id = row?.id;
            const parentViewName = store$.detail.parentViewName.get();

            if (fieldName && id && parentViewName) {
              realPreloadRoute({
                from: '/fastApp/$view/$id/overview',
                to: `/fastApp/${slugHelper().slugify(
                  parentViewName
                )}/${id}/${fieldName}`,
              });
            }
          })();
          break;

        case 'navigate':
          (() => {
            const id = state.id;
            if (id) {
              navigateRef.current({
                to: `/fastApp/${slugHelper().slugify(
                  state.view
                )}/${id}/overview`,
              });
            }
          })();

          break;

        case 'switch-detail-view':
          (() => {
            if (state.state.type === 'model' && id) {
              navigateRef.current({
                to: `/fastApp/$view/$id/${state.state.model}`,
                params: {
                  id,
                  view: slug,
                  model: state.state.model,
                },
              });
            } else if (id) {
              navigateRef.current({
                to: '/fastApp/$view/$id/overview',
                params: {
                  id,
                  view: slug ?? '',
                },
              });
            }
          })();

          break;

        default:
          break;
      }
    });
  }, [id, realPreloadRoute, slug, viewName]);
};
