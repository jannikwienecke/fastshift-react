import {
  createConfigFromConvexSchema,
  makeViews,
} from '@apps-next/convex-adapter-app';

import { CubeIcon, PersonIcon, TokensIcon } from '@radix-ui/react-icons';
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
      dueDate: {
        isDateField: true,
        defaultValue: () => {
          const tommorow = new Date();
          tommorow.setDate(tommorow.getDate() + 1);
          return tommorow.getTime();
        },
      },
      completed: {
        defaultValue: false,
        hideFromForm: true,
      },
      priority: {
        defaultValue: 1,
      },
      description: {
        richEditor: true,
      },
      deleted: { defaultValue: false },
      todos: {
        // hideFromForm: true,
        // showCheckboxInList: false,
      },
      tasks: {
        hideFromForm: true,
      },
    },

    includeFields: ['tags', 'tasks', 'todos'],
    query: {
      // sort so that the newest tasks are on top
      // sorting: { field: 'name', direction: 'asc' },
      // sorting: { field: '_creationTime', direction: 'desc' },
      showDeleted: false,
      primarySearchField: 'name',
      // default sorting
      // sorting: { field: 'projectId', direction: 'asc' },
      // grouping: { field: 'projectId' },
    },
    mutation: {
      softDelete: true,
      softDeleteField: 'deleted',
      beforeInsert: (data) => {
        return {
          ...data,
          completed: data.completed ?? false,
        };
      },
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
    fields: { dueDate: { isDateField: true } },
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

export const ownerConfig = createViewConfig(
  'owner',
  {
    icon: PersonIcon,
    displayField: { field: 'name' },
    // onInsert
    mutation: {
      beforeInsert: (data) => {
        return {
          ...data,
          name: data.firstname + ' ' + data.lastname,
        };
      },
    },
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
  ownerConfig,
]);
