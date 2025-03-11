'use client';

import { Projects, Tags } from '@apps-next/convex';
import {
  DataType,
  FieldConfig,
  GetTableName,
  renderModelName,
} from '@apps-next/core';
import { useViewOf } from '@apps-next/react';
import { Bubble, Icon } from '@apps-next/ui';
import { CustomTypeOptions } from 'i18next';
import { useTranslation } from 'react-i18next';
import { TranslationType } from '../i18n';

export type TaskViewDataType = DataType<
  'tasks',
  {
    projects: Projects;
    tags?: Tags[];
  }
>;

export const ViewBubble = (props: {
  tableName: GetTableName;
  value: string;
  color?: string;
  showIcon?: boolean;
}) => {
  const view = useViewOf(props.tableName);
  return (
    <Bubble
      label={props.value}
      icon={props.showIcon === false ? null : <Icon icon={view.icon || null} />}
      color={props.color}
    />
  );
};

// FEATURE: Have a default component library export for fields
// like: CheckboxField, TextField, Completed, Priority, Tags...
const PRIORITY_COLORS = {
  1: '🟢',
  2: '🟡',
  3: '🔴',
};

const PRIORITY_LABEL = {
  1: 'priority.low',
  2: 'priority.medium',
  3: 'priority.high',
} satisfies { [key: number]: TranslationType };

export const PriorityComponent = (props: { data: TaskViewDataType }) => {
  const priority = props.data.priority;

  return <div data-testid="priority">{PRIORITY_COLORS[priority]}</div>;
};

export const PriorityComponentCombobox = (props: {
  data: TaskViewDataType['priority'];
}) => {
  const { t } = useTranslation();
  const priority = props.data;

  return (
    <div className="flex items-center gap-2">
      <div>{PRIORITY_COLORS[priority]}</div>
      <div>{t(PRIORITY_LABEL[priority])}</div>
    </div>
  );
};

// Todo: Check typings of these components GetRowType<'category'>
export const CompletedComponent = (props: { data: TaskViewDataType }) => {
  const completed = props.data.completed;

  return <div>{completed ? '✅' : '❌'}</div>;
};

export const CompletedComponentCombobox = (props: {
  data: TaskViewDataType['completed'];
}) => {
  const completed = props.data;

  return <div>{completed ? '✅ Completed' : '❌ Not Completed'}</div>;
};

export const TagsComponent = (props: { data: TaskViewDataType }) => {
  const tags = props.data.tags;

  if (!tags) return null;

  const visibleTags = tags.slice(0, 4);

  return (
    <div className="flex items-center">
      <>
        {visibleTags.map((tag, index) => (
          <div
            key={tag.id + props.data.id}
            className={index !== 0 ? '-ml-2' : ''}
          >
            <RenderTag tag={tag} />
          </div>
        ))}

        {visibleTags.length < tags.length && (
          <div className={'-ml-2'}>
            <ViewBubble
              showIcon={false}
              tableName="tags"
              value={`+${tags.length - visibleTags.length} more`}
            />
          </div>
        )}
      </>
    </div>
  );
};

export const TagsDefaultComponent = (props: {
  data: NonNullable<TaskViewDataType['tags']>[number] | undefined;
}) => {
  const tag = props.data;

  if (!tag) return null;

  return <RenderTag tag={tag} />;
};

export const RenderTag = (props: { tag: Tags }) => {
  return (
    <ViewBubble
      tableName="tags"
      value={props.tag.name}
      color={props.tag.color}
      showIcon={false}
    />
  );
};

// export const TagsCombobox = (props: { data: TaskViewDataType['tag'][0] }) => {
//   const tag = props.data;

//   if (!tag) return null;
//   return (
//     <div className="flex gap-[2px] text-sm">
//       <div key={tag.id} className="flex items-center">
//         <div
//           style={{ backgroundColor: tag.color }}
//           className="w-[10px] h-[10px] rounded-full mr-3"
//         />

//         <div>{tag.name}</div>
//       </div>
//     </div>
//   );
// };

export const ProjectComponent = (props: { data: TaskViewDataType }) => {
  const project = props.data.projects;
  if (!project?.label) {
    return <>Set Project</>;
  }

  return <ViewBubble tableName="projects" value={String(project.label)} />;
};

export const ProjectComponentCombobox = (props: {
  data: TaskViewDataType['projects'];
}) => {
  const project = props.data;
  const view = useViewOf('projects');

  return (
    <div className="flex gap-2 items-center w-full">
      <Icon icon={view.icon} />
      <div className="text-sm">{project?.label}</div>
    </div>
  );
};

export const ProjectNameFieldItem = (props: { field: FieldConfig }) => {
  const { t } = useTranslation();

  console.log('ProjectNameFieldItem', props.field);
  return (
    <div className="flex gap-2 items-center w-full">
      {t('shared.rename', { model: renderModelName('tasks', t) })}
    </div>
  );
};
