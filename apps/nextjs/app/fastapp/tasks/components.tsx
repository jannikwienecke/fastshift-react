import { DataRow } from '@apps-next/core';
import { ViewBubble } from '@apps-next/react';
import { TaskViewDataType } from './tasks.types';
import React from 'react';

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleTags, setVisibleTags] = React.useState(tags);

  React.useEffect(() => {
    const updateVisibleTags = () => {
      if (!containerRef.current) return;

      const maxWidth = 100; // Adjust this value as needed
      let totalWidth = 0;
      let visibleCount = 0;

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.display = 'flex';
      document.body.appendChild(tempDiv);

      for (const tag of tags) {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'view-bubble'; // Make sure this class matches your ViewBubble styles
        tagDiv.textContent = tag.name;
        tempDiv.appendChild(tagDiv);

        const tagWidth = tagDiv.getBoundingClientRect().width;

        if (totalWidth + tagWidth > maxWidth) {
          break;
        }

        totalWidth += tagWidth;
        visibleCount++;
      }

      document.body.removeChild(tempDiv);
      setVisibleTags(tags.slice(0, visibleCount));
    };

    updateVisibleTags();
    window.addEventListener('resize', updateVisibleTags);
    return () => window.removeEventListener('resize', updateVisibleTags);
  }, [tags]);

  if (!tags) return null;

  return (
    <div ref={containerRef} className="flex items-center">
      {visibleTags.map((tag, index) => (
        <div key={tag.id} className={index !== 0 ? '-ml-2' : ''}>
          <ViewBubble tableName="tag" value={tag.name} color={tag.color} />
        </div>
      ))}

      {visibleTags.length < tags.length && (
        <div className={'-ml-2'}>
          <ViewBubble
            tableName="tag"
            value={`+${tags.length - visibleTags.length} more`}
          />
        </div>
      )}
    </div>
  );
};

export const TagsCombobox = (props: { data: DataRow<TaskViewDataType> }) => {
  const tags = props.data.getItemValue('tag');

  if (!tags) return null;
  return (
    <div className="flex gap-[2px] text-sm text-muted-foreground">
      {tags.map((tag) => (
        <div key={tag.id} className="flex items-center gap-4">
          <div
            style={{ backgroundColor: tag.color }}
            className="w-[10px] h-[10px] rounded-full"
          />
          <div>{tag.name}</div>
        </div>
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
