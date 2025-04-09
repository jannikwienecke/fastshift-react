import {
  createConfigFromConvexSchema,
  makeViews,
} from '@apps-next/convex-adapter-app';
import { z } from 'zod';
import { createViewConfig } from '@apps-next/react';
import { CubeIcon, PersonIcon, TokensIcon } from '@radix-ui/react-icons';
import { CheckCheckIcon, TagIcon } from 'lucide-react';
import schema, { Projects, Tags, Tasks, Todos } from '../convex/schema';
import { DataType } from '@apps-next/core';
import { TFunction } from 'i18next';

export * from '../convex/_generated/api';
export * from '../convex/schema';

export const config = createConfigFromConvexSchema(schema);

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
  }
}

// FIXME -> Defined in one place
type TaskViewDataType = DataType<
  'tasks',
  {
    projects: Projects;
    tags?: Tags[];
    tasks?: Tasks[];
    todos?: Todos[];
  }
>;

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
        validator: () => z.date().min(new Date()),
      },
      name: {
        validator: () => z.string().min(3),
        // optional -> otherwise it will use the default value
        validationErrorMessage: (t: TFunction) =>
          t('errors.minCharacters', { count: 3 }),
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

    localMode: {
      enabled: false,
    },
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
      beforeSelect: (data, options) => {
        const completeTask = options.recordWithInclude as TaskViewDataType;

        if (options.field === ('tags' satisfies keyof TaskViewDataType)) {
          const tags = completeTask.tags;
          const tagsAfterRemove =
            tags?.filter((tag) => !options.deleteIds.includes(tag._id)) ?? [];
          const allTagIds = Array.from(
            new Set([
              ...options.newIds,
              ...tagsAfterRemove.map((tag) => tag._id),
            ])
          );

          if (allTagIds.length > 3) {
            return {
              error: 'You can only have at most one tag',
            };
          } else if (allTagIds.length < 1) {
            return {
              error: 'You need to have at least one tag',
            };
          }
        }

        return {
          ...options,
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
