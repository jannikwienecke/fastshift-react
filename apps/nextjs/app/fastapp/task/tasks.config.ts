import { createViewConfig } from '@apps-next/core';

import { setClientViewConfig } from '@apps-next/core';
import {
  CompletedComponent,
  PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsCombobox,
  TagsComponent,
} from './tasks.components';
import { TaskViewDataType } from './tasks.types';
import { configurePrismaLoader } from '@apps-next/query-adapter';
import type { PrismaClientType } from '../../../db';

export const viewConfig = configurePrismaLoader(
  createViewConfig('task', {
    displayField: { field: 'name' },
    icon: 'FaTasks',
  })
)<PrismaClientType>({
  include: {
    tags: {
      include: { tag: true },
    },
  },
});

setClientViewConfig<TaskViewDataType>('task', {
  fields: {
    completed: {
      component: {
        list: CompletedComponent,
        // combobox: CompletedComponent,
      },
    },

    priority: {
      component: {
        list: PriorityComponent,
        combobox: PriorityComponentCombobox,
      },
    },

    tag: {
      component: {
        list: TagsComponent,
        combobox: TagsCombobox,
      },
    },
    project: {
      component: {
        list: ProjectComponent,
        combobox: ProjectComponentCombobox,
      },
    },
  },
});
