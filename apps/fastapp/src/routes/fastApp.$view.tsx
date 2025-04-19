import { config, views } from '@apps-next/convex';
import { _log } from '@apps-next/core';
import { ClientViewProviderConvex } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getViewData } from '../application-store/app.store.utils';
import { getQueryKey, getUserViewQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { useCommands } from '../shared/hooks/app.commands';
import { useAppEffects } from '../shared/hooks/app.effects';
import { getViewParms } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';
import React from 'react';

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

    return props.context.preloadQuery(viewData.viewConfig, viewName, null);
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

  useAppEffects(viewName);

  const { commands } = useCommands();

  React.useEffect(() => {
    console.log('RENDER!!');
  }, []);

  if (!viewData) return null;
  return (
    // render in upper level ->
    // expose a update function -> this
    <ClientViewProviderConvex
      commands={commands}
      views={views}
      viewConfig={activeViewConfig}
      globalConfig={config.config}
      uiViewConfig={activeViewUiConfig}
      queryKey={getQueryKey(activeViewConfig, viewName, null)}
      userViewData={userViewData}
      viewId={id || null}
    >
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </ClientViewProviderConvex>
  );
});
