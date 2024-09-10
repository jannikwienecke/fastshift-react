import {
  createConfigFromConvexSchema,
  makeViews,
} from '@apps-next/convex-adapter-app';
import { createViewConfig } from '@apps-next/react';
import schema from '../convex/schema';

export * from '../convex/_generated/api';
export * from '../convex/schema';

export const config = createConfigFromConvexSchema(schema);

export const tasksConfig = createViewConfig(
  'tasks',
  {
    viewName: 'task',
    icon: 'FaAddressBook',
    displayField: {
      field: 'name',
    },
  },
  config.config
);

export const projectsConfig = createViewConfig(
  'projects',
  {
    viewName: 'project',
    icon: 'FaProjectDiagram',
    displayField: {
      field: 'label',
    },
  },
  config.config
);

export const views = makeViews(config.config, [tasksConfig, projectsConfig]);
