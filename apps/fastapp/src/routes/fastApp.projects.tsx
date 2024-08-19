import { createView, QueryInput, useViewConfig } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/fastApp/projects')({
  component: createView(
    'projects',
    { displayField: { field: 'label' } },
    {
      Component: ({ useList }) => {
        const getListProps = useList();
        const { viewConfigManager } = useViewConfig();

        return (
          <div className="p-16">
            <h1>{viewConfigManager.getViewName()}</h1>

            <QueryInput />

            <List {...getListProps()} />
          </div>
        );
      },
    }
  ),
});
