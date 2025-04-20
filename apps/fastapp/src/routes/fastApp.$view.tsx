import { config, views } from '@apps-next/convex';
import {
  _log,
  BaseViewConfigManager,
  patchDict,
  QueryReturnOrUndefined,
} from '@apps-next/core';
import { ClientViewProviderConvex, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../application-store/app.store.utils';
import { getQueryKey, getUserViewQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { useCommands } from '../shared/hooks/app.commands';
import { useAppEffects } from '../shared/hooks/app.effects';
import { getViewParms, pachTheViews } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';

export const Route = createFileRoute('/fastApp/$view')({
  loader: async (props) => {
    const { viewName, slug } = getViewParms(props.params);
    _log.debug(`Loader for view: ${viewName} - slug: ${slug}`);

    await queryClient.ensureQueryData(getUserViewQuery(viewName));
    const { viewData } = getViewData(viewName);

    if (!viewData) {
      _log.warn(`View ${viewName} not found, redirecting to /fastApp`);
      return redirect({ to: '/fastApp' });
    }

    if (props.cause === 'enter' && store$.state.get() === 'pending') {
      console.log('ENTER!!!!!!');
      const viewConfigManager = new BaseViewConfigManager(
        {
          ...viewData.viewConfig,
        },
        viewData.uiViewConfig
      );

      store$.viewConfigManager.set(viewConfigManager);
    }

    await props.context.preloadQuery(
      viewData.viewConfig,
      viewName,
      null,
      null,
      null
    );
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  _log.debug('Render ViewMainComponent');

  const { viewName, id } = useViewParams();

  const { viewData, userViewData } = getViewData(viewName);

  const ViewComponent = viewData.main;
  const activeViewConfig = viewData.viewConfig;
  const activeViewUiConfig = viewData.uiViewConfig;

  const storeState = store$.state.get();
  const storeStateRef = React.useRef(storeState);

  React.useEffect(() => {
    storeStateRef.current = storeState;
  }, [storeState]);

  React.useLayoutEffect(() => {
    if (!id || storeStateRef.current === 'pending') {
      const data = queryClient.getQueryData(
        getQueryKey(viewData.viewConfig, viewName, null, null, null)
      ) as QueryReturnOrUndefined;

      console.log('INIT VIEW');

      const patechedViewFields = patchDict(
        viewData.viewConfig.viewFields,
        (f) => {
          const userFieldConfig = viewData.viewConfig.fields?.[f.name];
          const displayFIeld = viewData.viewConfig.displayField.field;
          const softDeleteField = viewData.viewConfig.mutation?.softDeleteField;
          const hideFieldFromForm =
            softDeleteField && softDeleteField === f.name;
          const isDisplayField =
            displayFIeld && f.name === displayFIeld ? true : undefined;

          return {
            ...f,
            ...(userFieldConfig ?? {}),
            label: f.label || `${f.name}.one`,
            isDisplayField: isDisplayField as true | undefined,
            editLabel: `${f.name}.edit`,
            hideFromForm: hideFieldFromForm || userFieldConfig?.hideFromForm,
          };
        }
      );

      const patchedViews = pachTheViews();

      const viewConfigManager = new BaseViewConfigManager(
        {
          ...viewData.viewConfig,
          viewFields: patechedViewFields,
        },
        viewData.uiViewConfig
      );

      store$.init(
        data?.data ?? [],
        data?.relationalData ?? {},
        data?.continueCursor ?? null,
        data?.isDone ?? false,
        viewConfigManager,
        patchedViews,
        viewData.uiViewConfig,
        [],
        userViewData,
        null
      );
    }
  }, [id, userViewData, viewData.uiViewConfig, viewData.viewConfig, viewName]);

  useAppEffects(viewName);

  const { commands } = useCommands();

  React.useEffect(() => {
    _log.debug('Render ViewMainComponent useEffect');
  }, []);

  if (!viewData) return null;
  return (
    <ClientViewProviderConvex
      commands={commands}
      views={views}
      viewConfig={activeViewConfig}
      globalConfig={config.config}
      uiViewConfig={activeViewUiConfig}
      queryKey={getQueryKey(activeViewConfig, viewName, null, null, null)}
      userViewData={userViewData}
      viewId={id || null}
    >
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </ClientViewProviderConvex>
  );
});
