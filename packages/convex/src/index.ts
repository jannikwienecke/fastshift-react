import {
  createConfigFromConvexSchema,
  makeViews,
} from '@apps-next/convex-adapter-app';

import { CubeIcon, TokensIcon } from '@radix-ui/react-icons';
import schema from '../convex/schema';
import { createViewConfig } from '@apps-next/react';
import { CheckCheckIcon, TagIcon } from 'lucide-react';

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
    viewName: 'Task',
    icon: CubeIcon,
    displayField: {
      field: 'name',
    },
    fields: {
      // IMPROVEMENT: [LATER] add smart feature..
      // dueDate (date in the name -> date field)
      // dueDate (date with upper case D -> Due Date)
      dueDate: { isDateField: true },
      completed: {
        defaultValue: true,
        hideFromForm: true,
      },
      todos: {
        hideFromForm: true,
        // showCheckboxInList: false,
      },
      tasks: {
        hideFromForm: true,
      },
    },
    includeFields: ['tags', 'tasks', 'todos'],
    query: {
      showDeleted: false,
      primarySearchField: 'name',
      // default sorting
      // sorting: { field: 'projectId', direction: 'asc' },
      // grouping: { field: 'projectId' },
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
    query: {
      showDeleted: false,
    },
    mutation: {
      softDelete: true,
      softDeleteField: 'deleted',
    },
  },
  config.config
);

export const tagsConfig = createViewConfig(
  'tags',
  {
    icon: TagIcon,
    displayField: { field: 'name' },
    colorField: { field: 'color' },
  },
  config.config
);

export const todosConfig = createViewConfig(
  'todos',
  {
    icon: CheckCheckIcon,
    displayField: { field: 'name' },
  },
  config.config
);

export const views = makeViews(config.config, [
  tasksConfig,
  projectsConfig,
  todosConfig,
  tagsConfig,
]);
