import {
  Categories,
  Owner,
  projectsConfig,
  Tasks,
  tasksConfig,
} from '@apps-next/convex';
import { DataType, makeDayMonthString } from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { DefaultViewTemplate } from './default-view-template';
import { makeViewFieldsConfig, viewRegistry } from '@apps-next/react';

type ProjectViewDataType = DataType<
  'projects',
  { categories: Categories; owner: Owner; tasks: Tasks }
>;

const uiViewConfig = makeViewFieldsConfig<ProjectViewDataType>('projects', {
  fields: {
    categories: {
      component: {
        list: ({ data }) => {
          return <>{data.categories?.label ?? 'Set Category'}</>;
        },
      },
    },
    tasks: {
      component: {
        list: ({ data }) => {
          const tasks = data.tasks.length;
          return (
            <div className="flex flex-row items-center gap-1 px-3 border border-gray-200 rounded-md">
              {tasks}
              <tasksConfig.icon className="w-4 h-4" />
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
    label: {
      component: {
        list: ({ data }) => {
          return <>{data.label}</>;
        },
      },
    },
    dueDate: {
      component: {
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
});

const ProjectsMainPage = observer(() => {
  return (
    <DefaultViewTemplate<ProjectViewDataType>
      listOptions={{
        fieldsLeft: ['label', 'description'],
        fieldsRight: ['categories', 'tasks'],
      }}
    />
  );
});

viewRegistry
  .addView(projectsConfig)
  .addComponents({ main: ProjectsMainPage })
  .addUiConfig(uiViewConfig);
