import { makeViewFieldsConfig } from '@apps-next/react';
import { DateItem, DateListItem } from '@apps-next/ui';
import {
  BarChartHorizontal,
  CalendarIcon,
  PencilLineIcon,
  TagIcon,
} from 'lucide-react';
import {
  CompletedComponent,
  CompletedComponentCombobox,
  NameFieldItem,
  NameFieldItemCommandbar,
  PriorityListItemComponent as PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsComponent,
  TagsDefaultComponent,
  TaskViewDataType,
} from './tasks.components';

import { todosConfig } from '@apps-next/convex';
import { t } from 'i18next';

export const uiViewConfig = makeViewFieldsConfig<TaskViewDataType>('tasks', {
  onDelete: {
    showConfirmation: true,
  },
  fields: {
    todos: {
      component: {
        list: ({ data }) => {
          const todos = data.todos?.filter?.((t) => t.completed)?.length || 0;
          const totalTodos = data.todos?.length || 0;

          const label = totalTodos === 0 ? '0' : `${todos} / ${totalTodos}`;

          return (
            <div className="w-[4.5rem] flex flex-row items-center gap-1 px-3 border border-gray-200 rounded-md">
              <span className="">{label}</span>

              <todosConfig.icon className="w-4 h-4" />
            </div>
          );
        },
        comboboxListValue: ({ data, row }) => {
          return (
            <div className="flex flex-row items-center gap-1">
              <div>{data.name}</div>
            </div>
          );
        },
      },
    },
    tags: {
      component: {
        list: TagsComponent,
        contextmenuFieldOption: TagsDefaultComponent,
      },
    },
    completed: {
      component: {
        list: CompletedComponent,
        comboboxListValue: CompletedComponentCombobox,
      },
    },

    priority: {
      component: {
        icon: BarChartHorizontal,
        list: PriorityComponent,
        comboboxListValue: PriorityComponentCombobox,
        contextmenuFieldOption: PriorityComponentCombobox,
        default: PriorityComponentCombobox,
      },
    },

    name: {
      // fieldLabel: () => t('tasks.edit'),
      component: {
        icon: PencilLineIcon,
        contextmenuFieldItem: NameFieldItem,
        commandbarFieldItem: NameFieldItemCommandbar,
      },
    },

    projects: {
      component: {
        list: ProjectComponent,
        comboboxListValue: ProjectComponentCombobox,
        contextmenuFieldOption: ProjectComponentCombobox,
      },
    },
    dueDate: {
      component: {
        icon: CalendarIcon,
        list: (props) => <DateItem value={props.data.dueDate} />,
        comboboxListValue: DateListItem,
      },
    },
  },
});
