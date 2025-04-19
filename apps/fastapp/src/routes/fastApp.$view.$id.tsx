import { QueryReturnOrUndefined } from '@apps-next/core';
import { FormField, RenderDetailComplexValue, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getViewData } from '../application-store/app.store.utils';
import { getQueryKey, getUserViewQuery, queryClient } from '../query-client';
import { useViewParams } from '../shared/hooks';
import { getViewParms } from '../shared/utils/app.helper';
import { DefaultDetailViewTemplate } from '../views/default-detail-view-template';

export const Route = createFileRoute('/fastApp/$view/$id')({
  loader: async (props) => {
    const { id, viewName } = getViewParms(props.params);

    if (!id) throw new Error('ID is required');

    await queryClient.ensureQueryData(getUserViewQuery(viewName));

    const { viewData } = getViewData(viewName);

    await props.context.preloadQuery(viewData.viewConfig, viewName, id);

    const queryKey = getQueryKey(viewData.viewConfig, viewName, id);

    const data = queryClient.getQueryData(queryKey) as QueryReturnOrUndefined;
    const rows = data.data;
    const row = rows?.find((r) => r.id === id);

    if (!row) {
      return redirect({ to: `/fastApp/${viewName}` });
    }
  },
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  const { rows } = store$.dataModel.get();
  const { viewName, id } = useViewParams();

  const { viewData } = getViewData(viewName);

  const row = rows.find((r) => r.id === id);

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
