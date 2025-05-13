import { Row } from '@apps-next/core';
import { FormField, globalStore, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute } from '@tanstack/react-router';
import { getViewData } from '../application-store/app.store.utils';
import { getUserViews } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { DefaultDetailOverviewTemplate } from '../views/default-detail-view-template';

export const Route = createFileRoute('/fastApp/$view/$id/overview')({
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  const row = store$.detail.row.get() as Row;
  if (!row) return null;

  globalStore.dispatch({
    type: 'LOAD_SUB_VIEW_OVERVIEW_PAGE',
  });

  let { viewName } = useViewParams();
  viewName = viewName as string;

  const userViews = getUserViews();
  const { viewData } = getViewData(viewName, userViews);

  if (viewData.overView) {
    return <viewData.overView />;
  }

  return (
    <DefaultDetailOverviewTemplate detailOptions={{}} FormField={FormField} />
  );
});
