import { schema } from '@apps-next/convex';
import { generateConfigFrom } from '@apps-next/react';

const config = generateConfigFrom('convex', schema);

export const projectsBaseView = config.createView('projects', {
  displayField: {
    field: 'label',
  },
});

export const taskBaseView = config.createView('tasks', {
  displayField: {
    field: 'name',
  },
  viewName: 'myTasks',
});
