import { Row } from '@apps-next/core';
import { useViewOf, ViewBubble } from '@apps-next/react';
import { Icon } from '@apps-next/ui';
import { TaskViewDataType } from './tasks.types';

// TODO: Have a default component library export for fields
// like: CheckboxField, TextField, Completed, Priority, Tags...
export const PriorityComponent = (props: { data: Row<TaskViewDataType> }) => {
  const PRIORITY_COLORS = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  const priority = props.data.getValue('priority');

  return <div>{PRIORITY_COLORS[priority]}</div>;
};

// Todo: Check typings of these components GetRowType<'category'>
export const CompletedComponent = (props: { data: Row<TaskViewDataType> }) => {
  const completed = props.data.getValue('completed');

  return <div>{completed ? '✅' : '❌'}</div>;
};

export const TagsComponent = (props: { data: Row<TaskViewDataType> }) => {
  const tags = props.data.getValue('tag');

  if (!tags) return null;

  const visibleTags = tags.slice(0, 4);

  return (
    <div className="flex items-center">
      <>
        {visibleTags.map((tag, index) => (
          <div key={tag.id} className={index !== 0 ? '-ml-2' : ''}>
            <ViewBubble
              tableName="tag"
              value={tag.label}
              color={tag.raw.color}
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

export const TagsCombobox = (props: {
  data: Row<TaskViewDataType['tag'][0]>;
}) => {
  const tag = props.data;

  if (!tag) return null;
  return (
    <div className="flex gap-[2px] text-sm">
      <div key={tag.id} className="flex items-center">
        <div
          style={{ backgroundColor: tag.raw.color }}
          className="w-[10px] h-[10px] rounded-full mr-3"
        />

        <div>{tag.label}</div>
      </div>
    </div>
  );
};

export const ProjectComponent = (props: { data: Row<TaskViewDataType> }) => {
  const project = props.data.getValue('project');
  return <ViewBubble tableName="project" value={String(project.raw.label)} />;
};

export const ProjectComponentCombobox = (props: {
  data: Row<TaskViewDataType['project']>;
}) => {
  const project = props.data;
  const view = useViewOf('project');

  return (
    <div className="flex gap-2 items-center w-full">
      <Icon icon={view.icon} />
      <div>{project.label}</div>
    </div>
  );
};
