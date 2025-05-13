import { DataType } from '@apps-next/core';
import { createViewConfig } from '@apps-next/react';
import { CubeIcon, PersonIcon, TokensIcon } from '@radix-ui/react-icons';
import { TFunction } from 'i18next';
import { CheckCheckIcon, TagIcon } from 'lucide-react';
import { z } from 'zod';
import { Projects, Tags, Tasks, Todos } from '../convex/schema';
import { config } from './server.config';

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
    viewName: 'Tasks',
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
        // TODO: Not working on server side validation for update as attribute
        validator: () => z.string().min(3),
        // optional -> otherwise it will use the default value
        validationErrorMessage: (t: TFunction) =>
          t('errors.minCharacters', { count: 3 }),
      },
      email: {
        validator: () => z.string().email(),
        validationErrorMessage: (t: TFunction) => t('errors.invalidEmail'),
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
      deleted_: { defaultValue: false },

      todos: {
        // hideFromForm: true,
        // showCheckboxInList: false,
      },
      tasks: {
        hideFromForm: true,
      },
      tags: {
        showInProperties: true,
      },
    },

    // localMode: { enabled: true },
    includeFields: ['tags', 'tasks', 'todos'],
    query: {
      // sort so that the newest tasks are on top
      // sorting: { field: 'name', direction: 'asc' },
      // sorting: { field: '_creationTime', direction: 'desc' },
      showDeleted: false,
      primarySearchField: 'name',
      // selectedViewFields: ['name'],
      // default sorting
      // sorting: { field: 'projectId', direction: 'asc' },
      // grouping: { field: 'projectId' },
    },
    ui: {
      showComboboxOnClickRelation: true,
    },
    mutation: {
      softDelete: true,
      softDeleteField: 'deleted_',

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
    viewName: 'projects',
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
      softDeleteField: 'deleted_',
    },
    ui: {
      showComboboxOnClickRelation: true,
    },
  },
  config.config
);

export const tagsConfig = createViewConfig(
  'tags',
  {
    icon: TagIcon,
    viewName: 'Tags',
    displayField: { field: 'name' },
    colorField: { field: 'color' },
  },
  config.config
);

export const ownerConfig = createViewConfig(
  'owner',
  {
    icon: PersonIcon,
    viewName: 'Owner',
    displayField: { field: 'name' },
    fields: {
      name: {
        hideFromForm: true,
      },
    },
    // onInsert
    mutation: {
      beforeInsert: (data) => {
        return {
          ...data,
          name: data.firstname + ' ' + data.lastname,
        };
        // FIXME -> also need to apply to update functions
      },
      beforeUpdate: (data, newData) => {
        console.log('beforeUpdate', data, newData);
        const newRecord = { ...data, ...newData };
        return {
          ...newRecord,
          name: newRecord.firstname + ' ' + newRecord.lastname,
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
    viewName: 'Todos',
    displayField: { field: 'name' },
  },
  config.config
);

export const usersConfig = createViewConfig(
  'users',
  {
    icon: PersonIcon,
    viewName: 'Users',
    displayField: { field: 'email' },
  },
  config.config
);

export const tasksTags = createViewConfig(
  'tasks_tags',
  {
    icon: PersonIcon,
    viewName: 'Tasks Tags',
    displayField: { field: 'tagId' },
    isManyToMany: true,
  },
  config.config
);
