import { createView, QueryInput, useView } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/fastApp/projects')({
  component: createView(
    'projects',
    { displayField: { field: 'label' } },
    ({ useList, useForm }) => {
      const getListProps = useList();
      const getFormProps = useForm();

      const { viewConfigManager } = useView();

      return (
        <div className="p-16">
          <h1>{viewConfigManager.getViewName()}</h1>

          <QueryInput />

          <Form {...getFormProps()} />

          <List.Default {...getListProps()} />
        </div>
      );
    }
  ),
});
