import { Row } from '@apps-next/core';
import {
  FormField,
  globalStore,
  makeHooks,
  RenderDetailComplexValue,
  store$,
} from '@apps-next/react';
import { detailPage } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/fastApp/$view/$id/overview')({
  component: () => <DetaiViewPage />,
});

const DetaiViewPage = observer(() => {
  const row = store$.detail.row.get() as Row;
  if (!row) return null;

  const { makeDetailPageProps } = makeHooks();
  const props = makeDetailPageProps({ row });

  globalStore.dispatch({
    type: 'LOAD_SUB_VIEW_OVERVIEW_PAGE',
  });

  return (
    <>
      <div data-testid="detail-form" className="pt-12 flex flex-col gap-4">
        <div className="pl-20">
          <detailPage.icon {...props} />
          <detailPage.formFields {...props} FormField={FormField} />
        </div>

        <div className="mt-12">
          <detailPage.tabs
            {...props}
            FormField={FormField}
            ComplexFormField={RenderDetailComplexValue}
          />
        </div>
      </div>
    </>
  );
});
