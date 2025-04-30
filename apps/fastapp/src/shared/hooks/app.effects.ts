import { _log, slugHelper } from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { useLocation, useRouter } from '@tanstack/react-router';
import React from 'react';
import { useViewParams } from './useViewParams';
import { getUserViews } from '../../query-client';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@apps-next/convex';

export const useAppEffects = (viewName: string) => {
  const router = useRouter();

  const navigateRef = React.useRef(router.navigate);
  const realPreloadRoute = router.preloadRoute;

  const realPreloadRouteRef = React.useRef(realPreloadRoute);

  const { id, slug } = useViewParams();
  const { pathname } = useLocation();

  const slugRef = React.useRef(slug);
  const viewNameRef = React.useRef(viewName);
  const idRef = React.useRef(id);

  React.useLayoutEffect(() => {
    slugRef.current = slug;
    viewNameRef.current = viewName;
    idRef.current = id;
  }, [viewName, slug, id]);

  const view = store$.viewConfigManager.viewConfig.viewName.get();

  const { data: views } = useQuery(convexQuery(api.query.getUserViews, {}));

  React.useEffect(() => {
    if (!views) return;
    store$.userViews.set(views);
  }, [views]);

  React.useEffect(() => {
    const isOverview = pathname.includes('/overview');
    if (!isOverview) return;

    const config = store$.viewConfigManager.viewConfig.get();
    const parentViewName = store$.detail.parentViewName.get();
    const parentId = store$.detail.row.get()?.id ?? null;

    if (!config || !parentViewName || !parentId) return;
    if (view.toLowerCase() === parentViewName.toLowerCase()) return;

    console.warn('____PRELOAD ROUTE INIT');
    realPreloadRouteRef.current({
      from: '/fastApp/$view/$id/overview',
      to: `/fastApp/${slugHelper().slugify(
        parentViewName
      )}/${parentId}/${view}`,
    });
  }, [pathname, realPreloadRoute, view]);

  const doOnceRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (doOnceRef.current) return;
    doOnceRef.current = true;

    store$.userViewSettings.viewCreated.slug.onChange(async (v) => {
      const views = getUserViews();

      store$.userViews.set(views);

      console.log('CREATED', v.value);

      const slug = v.value;
      if (slug) {
        await realPreloadRouteRef.current({
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
        realPreloadRouteRef.current({
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
              realPreloadRouteRef.current({
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
            if (state.state.type === 'model' && idRef.current) {
              navigateRef.current({
                to: `/fastApp/$view/$id/${state.state.model}`,
                params: {
                  id: idRef.current,
                  view: slugRef.current,
                  model: state.state.model,
                },
              });
            } else if (idRef.current) {
              navigateRef.current({
                to: '/fastApp/$view/$id/overview',
                params: {
                  id: idRef.current,
                  view: slugRef.current ?? '',
                },
              });
            }
          })();

          break;

        default:
          break;
      }
    });
  }, []);
};
