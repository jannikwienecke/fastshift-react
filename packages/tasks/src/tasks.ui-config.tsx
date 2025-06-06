import { makeViewFieldsConfig } from '@apps-next/react';
import { BubbleItem, DateItem, DateListItem } from '@apps-next/ui';
import {
  BarChartHorizontal,
  CalendarIcon,
  CheckCheckIcon,
  PencilLineIcon,
} from 'lucide-react';
import {
  CompletedComponent,
  CompletedComponentCombobox,
  NameFieldItem,
  NameFieldItemCommandbar,
  PriorityListItemComponent as PriorityComponent,
  PriorityComponentCombobox,
  PriorityDetailtemComponent,
  PriorityListItemComponent,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsComponent,
  TagsDefaultComponent,
} from './tasks.components';

import { DataType } from '@apps-next/core';
import { EnvelopeOpenIcon, MobileIcon } from '@radix-ui/react-icons';
// import { todosConfig } from '../server.config.all';
import { TaskViewDataType } from './tasks.types';

export const tasksUiViewConfig = makeViewFieldsConfig<TaskViewDataType>(
  'tasks',
  {
    onDelete: {
      showConfirmation: true,
    },
    renderCommandbarRow(props) {
      return (
        <div className="flex flex-row items-center gap-3">
          <CompletedComponent data={props.row.raw} />
          <PriorityListItemComponent data={props.row.raw} />

          <div>{props.row.label}</div>
        </div>
      );
    },
    fields: {
      tasks: {
        component: {
          comboboxListValue: ({ data, row }) => {
            const task = data as unknown as TaskViewDataType;
            if (!task) {
              console.debug('task is null');
              console.debug({ data, row });
              return null;
            }
            return (
              <div className="flex flex-row items-center gap-3">
                <div>{task.name}</div>
                <BubbleItem label={task.projects?.label ?? ''} />
              </div>
            );
          },
        },
      },
      todos: {
        component: {
          list: ({ data }) => {
            const todos = data.todos?.filter?.((t) => t.completed)?.length || 0;
            const totalTodos = data.todos?.length || 0;

            const label = totalTodos === 0 ? '0' : `${todos} / ${totalTodos}`;

            return (
              <div className="w-[4.5rem] whitespace-nowrap flex flex-row items-center gap-1 px-3 border border-gray-200 rounded-md">
                <span className="">{label}</span>

                {/* <todosConfig.icon className="w-4 h-4" /> */}
                <CheckCheckIcon className="w-4 h-4" />
              </div>
            );
          },

          comboboxListValue: ({ data, row }) => {
            const todo = data as unknown as DataType<'todos'> & {
              tasks?: DataType<'tasks'>;
            };

            return (
              <div className="flex flex-row items-center gap-3">
                <div>{data?.name} </div>
                {todo?.tasks?.name ? (
                  <BubbleItem label={todo.tasks.name} />
                ) : null}
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
          detailValue: PriorityDetailtemComponent,
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

      email: {
        component: {
          icon: EnvelopeOpenIcon,
        },
      },

      telefon: {
        component: {
          icon: MobileIcon,
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
  }
);
