import {
  _log,
  BaseViewConfigManager,
  getViewByName,
  makeData,
  patchAllViews,
  QueryReturnOrUndefined,
  Row,
} from '@apps-next/core';
import { FormField, RenderDetailComplexValue, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getViewData } from '../application-store/app.store.utils';
import { getQueryKey, getUserViewQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { getViewParms, pachTheViews } from '../shared/utils/app.helper';
import { DefaultDetailViewTemplate } from '../views/default-detail-view-template';
import { views } from '@apps-next/convex';
import React from 'react';

export const Route = createFileRoute('/fastApp/$view/$id')({
  loader: async (props) => {
    const { id, viewName } = getViewParms(props.params);

    if (!id) throw new Error('ID is required');

    await queryClient.ensureQueryData(getUserViewQuery(viewName));

    const { viewData } = getViewData(viewName);

    await props.context.preloadQuery(
      viewData.viewConfig,
      viewName,
      id,
      null,
      null
    );
  },
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  const { viewName, id } = useViewParams();
  const { viewData } = getViewData(viewName);

  React.useEffect(() => {
    if (!id) return;

    const queryKey = getQueryKey(viewData.viewConfig, viewName, id, null, null);

    const data = queryClient.getQueryData(queryKey) as QueryReturnOrUndefined;
    const rows = data.data;

    const patched = pachTheViews();

    const parsedRow = makeData(patched, viewName)(rows ?? []).rows?.[0];

    if (!parsedRow) {
      console.log('Row not found, redirecting to /fastApp');
      throw redirect({ to: `/fastApp/${viewName}` });
    }

    console.log('SET DETAIL!!!!!');

    const viewConfigManager = new BaseViewConfigManager(
      {
        ...viewData.viewConfig,
        viewFields: patched[viewName]?.viewFields ?? {},
      },
      viewData.uiViewConfig
    );

    store$.detail.viewConfigManager.set(viewConfigManager);

    store$.detail.row.set(parsedRow);
    store$.detail.detailRow.set(parsedRow);
    store$.detail.view.set({
      type: 'list',
      selectedRelation: 'tasks',
    });
  }, [id, viewData.uiViewConfig, viewData.viewConfig, viewName]);

  const view = getViewByName(pachTheViews(), viewName);

  if (!view) {
    _log.info(`View ${viewName} not found, redirecting to /fastApp`);
    throw redirect({ to: `/fastApp/${viewName}` });
  }

  const row = store$.detail.row.get() as Row;
  if (!row) {
    return <div>No data found</div>;
  }

  if (viewData.detail) {
    return <viewData.detail row={row} />;
  }

  return (
    <DefaultDetailViewTemplate
      formField={FormField}
      complexFormField={RenderDetailComplexValue}
      detailOptions={{ row }}
    />
  );
});
