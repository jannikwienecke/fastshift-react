import { DataType } from '@apps-next/core';
import { _createViewConfig } from '@apps-next/react';
import { CubeIcon } from '@radix-ui/react-icons';
import { TFunction } from 'i18next';
import { z } from 'zod';
import { TaskViewDataType } from './tasks.types';

export const tasksConfig = _createViewConfig('tasks', {
  icon: CubeIcon,
  displayField: {
    field: 'name',
  },

  fields: {
    projectId: {
      useAsSidebarFilter: true,
      includeInRelationalDataQuery: true,
    },

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
      getEnumLabel(t, value) {
        switch (value as unknown as DataType<'tasks'>['priority']) {
          case 1:
            return t('priority.none');
          case 2:
            return t('priority.low');
          case 3:
            return t('priority.medium');
          case 4:
            return t('priority.high');
          case 5:
            return t('priority.urgent');
        }
      },
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
      useAsSidebarFilter: true,
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
          new Set([...options.newIds, ...tagsAfterRemove.map((tag) => tag._id)])
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
});
