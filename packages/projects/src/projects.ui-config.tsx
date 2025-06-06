import { makeDayMonthString } from '@apps-next/core';
import { makeViewFieldsConfig } from '@apps-next/react';
import { BubbleItem } from '@apps-next/ui';
import { CalendarIcon, ComponentIcon, PencilIcon } from 'lucide-react';
import { ProjectViewDataType } from './projects.types';
import { tasksConfig } from '@apps-next/tasks';

export const uiViewConfig = makeViewFieldsConfig<ProjectViewDataType>(
  'projects',
  {
    renderCommandbarRow(props) {
      return (
        <div className="flex flex-row items-center gap-3">
          <div>{props.row.label}</div>

          <div className="text-xs text-foreground/70 truncate w-56">
            {props.row.raw.description}
          </div>
        </div>
      );
    },
    fields: {
      categories: {
        component: {
          icon: ComponentIcon,
          list: ({ data }) => {
            return <>{data.categories?.label ?? 'Set Category'}</>;
          },
        },
      },
      tasks: {
        component: {
          list: ({ data }) => {
            const tasks = data.tasks?.length;
            return (
              <div className="flex flex-row items-center gap-1 px-3 border border-gray-200 rounded-md">
                {tasks}
                <tasksConfig.configOptions.icon className="w-4 h-4" />
              </div>
            );
          },
          comboboxListValue: (props) => {
            const task = props.data;

            return (
              <div className="flex flex-row items-center gap-3">
                <div>{task.name}</div>
                {props.data.projects?.label ? (
                  <BubbleItem label={props.data.projects.label ?? ''} />
                ) : null}
              </div>
            );
          },
        },
      },
      owner: {
        component: {
          comboboxListValue: ({ data }) => {
            return <>{data?.firstname + ' ' + data.lastname}</>;
          },
          list: ({ data }) => {
            return <>{data.owner?.firstname ?? 'Set Owner'}</>;
          },
        },
      },
      description: {
        component: {
          icon: PencilIcon,
        },
      },
      label: {
        component: {
          icon: PencilIcon,
          list: ({ data }) => {
            return <>{data.label}</>;
          },
        },
      },
      dueDate: {
        component: {
          icon: CalendarIcon,
          list: ({ data }) => {
            const date = new Date(data.dueDate);

            return (
              <div className="flex flex-col items-start">
                <span className="text-xs text-foreground/80">
                  {makeDayMonthString(date)}
                </span>
              </div>
            );
          },
        },
      },
    },
  }
);
