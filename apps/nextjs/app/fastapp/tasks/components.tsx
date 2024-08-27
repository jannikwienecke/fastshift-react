import { DataRow } from '@apps-next/core';
import { ViewBubble } from '@apps-next/react';
import { TaskViewDataType } from './tasks.types';

// TODO: Have a default component library export for fields
// like: CheckboxField, TextField, Completed, Priority, Tags...
export const PriorityComponent = (props: {
  data: DataRow<TaskViewDataType>;
}) => {
  const PRIORITY_COLORS = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  const priority = props.data.getItemValue('priority');

  return <div>{PRIORITY_COLORS[priority]}</div>;
};

// Todo: Check typings of these components GetRowType<'category'>
export const CompletedComponent = (props: {
  data: DataRow<TaskViewDataType>;
}) => {
  const completed = props.data.getItemValue('completed');

  return <div>{completed ? '✅' : '❌'}</div>;
};

export const TagsComponent = (props: { data: DataRow<TaskViewDataType> }) => {
  const tags = props.data.getItemValue('tag');
  if (!tags) return null;
  return (
    <div className="flex gap-[2px]">
      {tags.map((tag) => (
        <ViewBubble
          key={tag.id}
          tableName="tag"
          value={tag.name}
          color={tag.color}
        />
      ))}
    </div>
  );
};

export const ProjectComponent = (props: {
  data: DataRow<TaskViewDataType>;
}) => {
  const project = props.data.getItemValue('project');
  return <ViewBubble tableName="project" value={String(project.label)} />;
};
