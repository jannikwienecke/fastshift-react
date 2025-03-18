import { Projects, Tags, Tasks, Todos } from '@apps-next/convex';
import {
  DataType,
  FieldConfig,
  GetTableName,
  renderModelName,
} from '@apps-next/core';
import { useViewOf } from '@apps-next/react';
import { BubbleItem, BubbleList, Icon, PriorityComponent } from '@apps-next/ui';
import { useTranslation } from 'react-i18next';

export type TaskViewDataType = DataType<
  'tasks',
  {
    projects: Projects;
    tags?: Tags[];
    tasks?: Tasks[];
    todos?: Todos[];
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
    <BubbleItem
      label={props.value}
      icon={props.showIcon === false ? null : view.icon}
      color={props.color}
    />
  );
};

const priorityMap = {
  1: 'none',
  2: 'low',
  3: 'medium',
  4: 'high',
  5: 'urgent',
} as const;

export const PriorityListItemComponent = (props: {
  data: TaskViewDataType;
}) => {
  const priority = priorityMap[props.data.priority];

  return <PriorityComponent priority={priority} />;
};

export const PriorityComponentCombobox = (props: { data: string }) => {
  const priority =
    priorityMap[String(props.data) as unknown as TaskViewDataType['priority']];
  return <PriorityComponent priority={priority} showLabel={true} />;
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

  return (
    <BubbleList
      items={tags.map((t) => {
        return {
          label: t.name,
          color: t.color,
          icon: null,
        };
      })}
    />
  );
};

export const TagsDefaultComponent = (props: {
  data: NonNullable<TaskViewDataType['tags']>[number] | undefined;
}) => {
  const tag = props.data;

  if (!tag) return null;

  return <BubbleItem label={tag.name} color={tag.color} icon={null} />;
};

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

  return (
    <div className="flex gap-2 items-center w-full">
      {t('shared.rename', { model: renderModelName('tasks', t) })}
    </div>
  );
};
