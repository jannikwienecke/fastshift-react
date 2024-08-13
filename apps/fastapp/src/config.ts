import { schema } from '@apps-next/convex';
import { createConfigFromConvexSchema } from '@apps-next/react';

const config = createConfigFromConvexSchema(schema);

export const projectsBaseView = config.createBaseView('projects', {
  labelKey: 'text',
});

export const taskBaseView = config.createBaseView('tasks', {
  labelKey: 'name',
  viewName: 'myTasks',
});
