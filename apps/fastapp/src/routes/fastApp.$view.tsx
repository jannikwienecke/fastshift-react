import { _log } from '@apps-next/core';
import { store$, viewRegistry } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { getViewData } from '../application-store/app.store.utils';
import { useViewParams } from '../shared/hooks';
import { getViewParms } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';

export const Route = createFileRoute('/fastApp/$view')({
  loader: async (props) => {
    const { viewName } = getViewParms(props.params);
    if (!viewName) return;

    if (props.cause !== 'preload') return;

    const { viewConfig } = viewRegistry.getView(viewName) ?? {};

    console.warn('---> PRELOAD QUERY', viewConfig);
    await props.context.preloadQuery(viewConfig, viewName, null, null, null);
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  _log.debug('Render ViewMainComponent');

  let { viewName } = useViewParams();
  viewName = viewName as string;

  const { viewData } = getViewData(viewName);

  const ViewComponent = viewData.main;

  React.useEffect(() => {
    _log.debug('Render ViewMainComponent useEffect');
  }, []);

  if (!viewData) return null;
  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
