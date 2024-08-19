import { createView } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/fastApp/projects')({
  component: createView(
    'projects',
    { displayField: { field: 'label' } },
    {
      Component: ({ data, useList }) => {
        const getListProps = useList();

        return (
          <div>
            <List {...getListProps()} />
          </div>
        );
      },
    }
  ),
});
