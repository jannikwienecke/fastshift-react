import { makeViewFieldsConfig } from '@apps-next/react';
import { DateItem, DateListItem } from '@apps-next/ui';
import { BarChartHorizontal, PencilLineIcon } from 'lucide-react';
import {
  CompletedComponent,
  CompletedComponentCombobox,
  PriorityListItemComponent as PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  ProjectNameFieldItem,
  TagsComponent,
  TagsDefaultComponent,
  TaskViewDataType,
} from './tasks.components';

export const viewFieldsConfig = makeViewFieldsConfig<TaskViewDataType>(
  'tasks',
  {
    fields: {
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
        component: {
          icon: PencilLineIcon,
          contextmenuFieldItem: ProjectNameFieldItem,
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
          list: (props) => <DateItem value={props.data.dueDate} />,
          comboboxListValue: DateListItem,
        },
      },
    },
  }
);
