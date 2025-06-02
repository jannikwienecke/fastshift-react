import { views } from '@apps-next/convex';
import { GetTableName, slugHelper } from '@apps-next/core';
import { store$, viewActionStore } from '@apps-next/react';
import { observable } from '@legendapp/state';
import { useLocation, useRouter } from '@tanstack/react-router';
import React from 'react';
import { useTranslation as useTranslationReact } from 'react-i18next';
import { getUserViews } from '../../query-client';
import { useUserViews } from './use-user-views';
import { useViewParams } from './useViewParams';

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

  const { allViews: userViews, refetch } = useUserViews();

  React.useEffect(() => {
    if (!userViews) return;

    store$.updateUserViews(userViews);
  }, [userViews]);

  const [_, i18n] = useTranslationReact();

  const ignoreFirstRef = React.useRef(true);
  React.useEffect(() => {
    if (ignoreFirstRef.current) {
      ignoreFirstRef.current = false;
      return;
    }

    viewActionStore.setViews(views);
  }, [i18n.language]);

  React.useEffect(() => {
    const isOverview = pathname.includes('/overview');
    if (!isOverview) return;

    const config = store$.viewConfigManager.viewConfig.get();
    const parentId = store$.detail.row.get()?.id ?? null;

    setTimeout(() => {
      const parentViewName = store$.detail.parentViewName.get();
      if (!config || !parentViewName || !parentId) return;
      if (view.toLowerCase() === parentViewName.toLowerCase()) return;

      realPreloadRouteRef.current({
        from: '/fastApp/$view/$id/overview',
        to: `/fastApp/${slugHelper().slugify(parentViewName)}/${parentId}/${
          viewNameRef.current
        }`,
      });
    }, 50);
  }, [pathname, realPreloadRoute, view]);

  const doOnceRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (doOnceRef.current) return;
    doOnceRef.current = true;

    store$.userViewSettings.viewCreated.slug.onChange(async (v) => {
      const views = getUserViews();

      store$.userViews.set(views);

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

      const view = store$.viewConfigManager.getViewName();
      const userViewData = store$.userViewData.get();
      const slug = userViewData?.slug || view;
      const viewsNotPreload: GetTableName[] = ['history'];

      const isInNotPreload = viewsNotPreload.find((v) =>
        v.includes(store$.viewConfigManager.getTableName())
      );

      if (store$.detail.viewType.type.get() === 'overview') return;

      if (isInNotPreload) return;

      if (row?.row?.id) {
        realPreloadRouteRef.current({
          from: '/fastApp/$view',
          to: `/fastApp/${slug}/${row.row.id}/overview`,
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
          (async () => {
            const id = state.id;

            if (id) {
              navigateRef.current({
                to: `/fastApp/${slugHelper().slugify(
                  state.view
                )}/${id}/overview`,
              });
            } else {
              //important dont delete.
              // when we are on tasks -> sub todos list
              // and we click on the parent tasks view
              // without this, we would see the todos list for a moment and then the tasks list
              // with the invalidate, we will force the loader of the view to be called
              // router.invalidate();
              navigateRef.current({
                to: `/fastApp/${slugHelper().slugify(
                  state.slug ?? state.view
                )}`,
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

    store$.mutating.mutation.onChange((changes) => {
      const mutation = changes.value;
      if (!mutation) return;

      const viewMutation = mutation.type === 'NEW_USER_VIEW_MUTATION';

      if (!viewMutation) {
        router.cleanCache();
      }

      if (store$.detail.viewType.type.get() === 'overview') {
        router.invalidate();
      }

      isMutation$.set(true);
    });

    store$.state.onChange((changes) => {
      const state = changes.value;

      if (state === 'initialized') {
        if (isMutation$.get()) {
          console.debug('Mutation detected, refetching user views...');
          refetch();
          isMutation$.set(false);
        }
      }
    });
  }, []);
};

const isMutation$ = observable(false);
