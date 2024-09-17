import {
  createConfigFromConvexSchema,
  makeViews,
} from '@apps-next/convex-adapter-app';
import { createViewConfig } from '@apps-next/react';
import { CubeIcon, TokensIcon } from '@radix-ui/react-icons';
import schema from '../convex/schema';

export * from '../convex/_generated/api';
export * from '../convex/schema';

export const config = createConfigFromConvexSchema(schema);

export const tasksConfig = createViewConfig(
  'tasks',
  {
    viewName: 'task',
    icon: CubeIcon,
    displayField: {
      field: 'name',
    },
    includeFields: ['tags'],
  },
  config.config
);

export const projectsConfig = createViewConfig(
  'projects',
  {
    viewName: 'my-project-view',
    icon: TokensIcon,
    includeFields: ['tasks'],
    displayField: {
      field: 'label',
    },
  },
  config.config
);

export const views = makeViews(config.config, [tasksConfig, projectsConfig]);
