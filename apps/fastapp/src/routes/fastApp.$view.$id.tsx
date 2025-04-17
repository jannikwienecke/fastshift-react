import { tasksConfig } from '@apps-next/convex';
import { QueryReturnOrUndefined } from '@apps-next/core';
import { FormField, RenderDetailComplexValue, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, redirect, useParams } from '@tanstack/react-router';
import { getQueryKey, queryClient } from '../query-client';
import { DefaultDetailViewTemplate } from '../views/default-detail-view-template';

export const Route = createFileRoute('/fastApp/$view/$id')({
  loader: async (props) => {
    const { view, id } = props.params;
    await props.context.preloadQuery(tasksConfig, props.params.view, id);

    const queryKey = getQueryKey(tasksConfig, view, id);
    const data = queryClient.getQueryData(queryKey) as QueryReturnOrUndefined;
    const rows = data.data;

    const row = rows?.find((r) => r.id === id);

    if (!row) {
      return redirect({ to: `/fastApp/${view}` });
    }
  },
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  const { rows } = store$.dataModel.get();

  const params = useParams({ from: '/fastApp/$view/$id' });

  const row = rows.find((r) => r.id === params.id);

  if (!row) {
    return <div>No data found</div>;
  }

  return (
    <DefaultDetailViewTemplate
      formField={FormField}
      complexFormField={RenderDetailComplexValue}
      detailOptions={{ row }}
    />
  );
});
