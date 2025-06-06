import { RegisteredViews, ViewConfigType, ViewRegistry } from '@apps-next/core';
import { tasksUiViewConfig } from './tasks.ui-config';
import { TaskDetailView, TaskListView } from './tasks.view';

export const register = (
  views: RegisteredViews,
  viewRegistry: ViewRegistry
) => {
  const config = views['tasks'] as ViewConfigType<'tasks'>;
  viewRegistry
    .addView(config)
    .addComponents({ main: TaskListView, detail: TaskDetailView })
    .addUiConfig(tasksUiViewConfig);
};
