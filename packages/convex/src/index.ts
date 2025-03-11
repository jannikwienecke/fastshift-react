import {
  createConfigFromConvexSchema,
  makeViews,
} from '@apps-next/convex-adapter-app';

import { CubeIcon, TokensIcon } from '@radix-ui/react-icons';
import schema from '../convex/schema';
import { createViewConfig } from '@apps-next/react';

export * from '../convex/_generated/api';
export * from '../convex/schema';

export const config = createConfigFromConvexSchema(schema);

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
  }
}

export const tasksConfig = createViewConfig(
  'tasks',
  {
    viewName: 'task',
    icon: CubeIcon,
    displayField: {
      field: 'name',
    },
    fields: {
      // IMPROVEMENT: add smart feature..
      // dueDate (date in the name -> date field)
      // dueDate (date with upper case D -> Due Date)
      dueDate: { isDateField: true },
    },
    includeFields: ['tags'],
    query: {
      showDeleted: false,
      primarySearchField: 'name',
    },
    mutation: {
      softDelete: true,
      softDeleteField: 'deleted',
    },
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
