import { MakeDetailPropsOption } from '@apps-next/core';
import { makeHooks } from '@apps-next/react';
import {
  DefaultDetailViewTemplate,
  DefaultViewTemplate,
} from '@apps-next/shared';
import { InputDialog } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { TaskViewDataType } from './tasks.types';

export const TaskListView = observer((props) => {
  const { makeInputDialogProps } = makeHooks<TaskViewDataType>();

  return (
    <DefaultViewTemplate<TaskViewDataType>
      {...props}
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

export const TaskDetailView = observer((options: MakeDetailPropsOption) => {
  return <DefaultDetailViewTemplate detailOptions={options} />;
});
