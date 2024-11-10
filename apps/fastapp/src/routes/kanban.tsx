import { closestCorners, DndContext, DragOverlay } from '@dnd-kit/core';
import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Column } from '../components/KanbanBoard/Column';
import { KanbanCard } from '../components/KanbanBoard/TaskCard';
import {
  IBaseItem,
  IColumn,
  ITask,
  OnItemChangeProps,
  RenderItemProps,
} from '../components/KanbanBoard/types';
import { useKanbanBoard } from '../components/KanbanBoard/use-kanban-board';

interface IKanbanBoardProps<T extends IBaseItem> {
  data: {
    items: T[];
    columns: IColumn[];
  };
  callbacks: {
    onItemChange?: (props: OnItemChangeProps<T>) => T[];
    renderItem: (props: RenderItemProps<T>) => React.ReactNode;
  };
}

function KanbanBoard<T extends IBaseItem>({
  data: { items: initialItems, columns },
  callbacks: { onItemChange, renderItem },
}: IKanbanBoardProps<T>) {
  const {
    activeItem,
    isDraggingInSameColumn,
    activeColumnId,
    sensors,
    getItemsByColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanBoard({
    initialItems,
    columns,
    onItemChange,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">Kanban Board</h1>
        <div className="flex gap-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={{
                ...column,
                items: getItemsByColumn(column.id),
              }}
              activeId={activeItem?.id ?? null}
              isDraggingInSameColumn={isDraggingInSameColumn}
              isOver={activeColumnId === column.id}
              renderItem={renderItem}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeItem
          ? renderItem({
              item: activeItem,
              isPreview: true,
              isOverlay: true,
              isDraggingInSameColumn: false,
            })
          : null}
      </DragOverlay>
    </DndContext>
  );
}

// Example usage with tasks
const defaultColumns: IColumn[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
];

const defaultTasks: ITask[] = [
  { id: '1', title: 'Task 1', columnId: 'TODO' },
  { id: '2', title: 'Task 2', columnId: 'TODO' },
  { id: '3', title: 'Task 3', columnId: 'IN_PROGRESS' },
  { id: '4', title: 'Task 4', columnId: 'DONE' },
];

export const Route = createFileRoute('/kanban')({
  component: KanbanPage,
});

function KanbanPage() {
  const [items, setItems] = useState<ITask[]>(defaultTasks);

  return (
    <KanbanBoard
      data={{
        items,
        columns: defaultColumns,
      }}
      callbacks={{
        onItemChange: (props) => {
          const newItems = items.map((item) =>
            item.id === props.itemId
              ? { ...item, columnId: props.newColumnId }
              : item
          );
          setItems(newItems);
          return newItems;
        },
        renderItem: (props) => <KanbanCard key={props.item.id} {...props} />,
      }}
    />
  );
}
