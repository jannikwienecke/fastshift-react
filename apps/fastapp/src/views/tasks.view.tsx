import { tasksConfig } from '@apps-next/convex';
import { MakeDetailPropsOption, NewHistoryType } from '@apps-next/core';
import {
  getView,
  makeHooks,
  RenderActivityList,
  store$,
  viewRegistry,
} from '@apps-next/react';
import { InputDialog } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { DefaultViewTemplate } from '../views/default-view-template';
import { TaskViewDataType } from '../views/tasks.components';
import { DefaultDetailViewTemplate } from './default-detail-view-template';
import { tasksUiViewConfig } from './tasks.config';
import { PersonIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

const Task = observer((props) => {
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

  // const { makeDetailPageProps } = makeHooks<TaskViewDataType>();
  // const props = makeDetailPageProps(options);
  // return (
  //   <>
  //     <div className="pl-24 pt-8 text-sm border-t-[.5px] flex flex-col">
  //       <RenderActivityList historyData={props.tabs?.historyData ?? []} />
  //     </div>
  //   </>
  // );
});

viewRegistry
  .addView(tasksConfig)
  .addComponents({ main: Task, detail: TaskDetailPage })
  .addUiConfig(tasksUiViewConfig);
