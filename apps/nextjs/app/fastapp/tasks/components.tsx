import { GetRowType } from '@apps-next/core';

// TODO: Have a default component library export for fields
// like: CheckboxField, TextField, Completed, Priority, Tags...
export const PriorityComponent = (props: { data: GetRowType<'task'> }) => {
  const PRIORITY_COLORS = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  const priority = props.data.getItemValue('priority');

  return <div>{PRIORITY_COLORS[priority]}</div>;
};

export const CompletedComponent = (props: { data: GetRowType<'task'> }) => {
  const completed = props.data.getItemValue('completed');

  return <div>{completed ? '✅' : '❌'}</div>;
};

export const TagsComponent = (props: { data: any }) => {
  const tags = props.data.getItemValue('tags');

  if (!tags) return null;

  return <div>{tags?.map((tag: any) => tag.name).join(', ')}</div>;
};
