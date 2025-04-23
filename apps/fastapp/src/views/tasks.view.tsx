import { tasksConfig } from '@apps-next/convex';
import { MakeDetailPropsOption } from '@apps-next/core';
import { makeHooks, viewRegistry } from '@apps-next/react';
import { InputDialog } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { DefaultViewTemplate } from '../views/default-view-template';
import { TaskViewDataType } from '../views/tasks.components';
import { DefaultDetailViewTemplate } from './default-detail-view-template';
import { tasksUiViewConfig } from './tasks.config';

const Task = observer(() => {
  const { makeInputDialogProps } = makeHooks<TaskViewDataType>();

  return (
    <DefaultViewTemplate<TaskViewDataType>
      listOptions={{
        // handle if no fields are provided -> all fields shown in fields left...
        // fieldsLeft: [],
        // fieldsRight: [],
        fieldsLeft: ['name', 'projects', 'dueDate'],
        fieldsRight: ['tags', 'completed', 'priority', 'todos'],
      }}
      filterOptions={{
        hideFields: [],
      }}
      displayOptions={{
        displayFieldsToShow: [
          'name',
          'completed',
          'description',
          'name',
          'priority',
          'projects',
          'tags',
        ],
      }}
      RenderInputDialog={observer(() => (
        <InputDialog.Default {...makeInputDialogProps({})} />
      ))}
    />
  );
});

const TaskDetailPage = observer((options: MakeDetailPropsOption) => {
  return <DefaultDetailViewTemplate detailOptions={options} />;
});

viewRegistry
  .addView(tasksConfig)
  .addComponents({ main: Task, detail: TaskDetailPage })
  .addUiConfig(tasksUiViewConfig);
