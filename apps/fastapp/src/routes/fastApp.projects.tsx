import { createView, QueryInput, useView } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/fastApp/projects')({
  component: createView(
    'projects',
    { displayField: { field: 'label' } },
    ({ useList }) => {
      console.log('RUN PROJECTS');
      const getListProps = useList();
      const { viewConfigManager } = useView();

      return (
        <div className="p-16">
          <h1>{viewConfigManager.getViewName()}</h1>

          <QueryInput />

          <List {...getListProps()} />
        </div>
      );
    }
  ),
});
