import { useViewOf } from '@apps-next/react';
import { Bubble, Icon } from '@apps-next/ui';
import { TaskViewDataType } from './tasks.types';
import { GetTableName } from '@apps-next/core';

export const ViewBubble = (props: {
  tableName: GetTableName;
  value: string;
  color?: string;
  showIcon?: boolean;
}) => {
  const view = useViewOf(props.tableName as string);
  return (
    <Bubble
      label={props.value}
      icon={props.showIcon === false ? null : <Icon icon={view.icon || null} />}
      color={props.color}
    />
  );
};

// TODO: Have a default component library export for fields
// like: CheckboxField, TextField, Completed, Priority, Tags...
const PRIORITY_COLORS = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

export const PriorityComponent = (props: { data: TaskViewDataType }) => {
  const priority = props.data.priority;

  return <div>{PRIORITY_COLORS[priority]}</div>;
};

export const PriorityComponentCombobox = (props: {
  data: TaskViewDataType['priority'];
}) => {
  const priority = props.data;

  return (
    <div className="flex items-center gap-2">
      <div>{PRIORITY_COLORS[priority]}</div>
      <div>{priority}</div>
    </div>
  );
};

// Todo: Check typings of these components GetRowType<'category'>
export const CompletedComponent = (props: { data: TaskViewDataType }) => {
  const completed = props.data.completed;

  return <div>{completed ? '✅' : '❌'}</div>;
};

export const TagsComponent = (props: { data: TaskViewDataType }) => {
  const tags = props.data.tag;

  if (!tags) return null;

  const visibleTags = tags.slice(0, 4);

  return (
    <div className="flex items-center">
      <>
        {visibleTags.map((tag, index) => (
          <div key={tag.id} className={index !== 0 ? '-ml-2' : ''}>
            <ViewBubble
              tableName="tag"
              value={tag.name}
              color={tag.color}
              showIcon={false}
            />
          </div>
        ))}

        {visibleTags.length < tags.length && (
          <div className={'-ml-2'}>
            <ViewBubble
              showIcon={false}
              tableName="tag"
              value={`+${tags.length - visibleTags.length} more`}
            />
          </div>
        )}
      </>
    </div>
  );
};

export const TagsCombobox = (props: { data: TaskViewDataType['tag'][0] }) => {
  const tag = props.data;

  if (!tag) return null;
  return (
    <div className="flex gap-[2px] text-sm">
      <div key={tag.id} className="flex items-center">
        <div
          style={{ backgroundColor: tag.color }}
          className="w-[10px] h-[10px] rounded-full mr-3"
        />

        <div>{tag.name}</div>
      </div>
    </div>
  );
};

export const ProjectComponent = (props: { data: TaskViewDataType }) => {
  const project = props.data.project;

  if (!project?.label) {
    return <>Set Project</>;
  }

  return <ViewBubble tableName="project" value={String(project.label)} />;
};

export const ProjectComponentCombobox = (props: {
  data: TaskViewDataType['project'];
}) => {
  const project = props.data;
  const view = useViewOf('project');

  return (
    <div className="flex gap-2 items-center w-full">
      <Icon icon={view.icon} />
      <div>{project?.label}</div>
    </div>
  );
};
