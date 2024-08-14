import { schema } from '@apps-next/convex';
import { createConfigFromConvexSchema } from '@apps-next/react';

const config = createConfigFromConvexSchema(schema);

export const projectsBaseView = config.createBaseView('projects', {
  displayField: {
    field: 'text',
  },
  query: {
    // searchablefField: {
    //   field: 'text',
    //   name: 'text',
    //   filterFields: [],
    // },
  },
});

export const taskBaseView = config.createBaseView('tasks', {
  displayField: {
    field: 'name',
  },
  viewName: 'myTasks',
});
