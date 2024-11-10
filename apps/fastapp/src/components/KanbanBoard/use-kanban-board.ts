import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { IBaseItem, UseKanbanBoardProps } from './types';

export function useKanbanBoard<T extends IBaseItem>({
  initialItems,
  columns,
  onItemChange,
}: UseKanbanBoardProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const [isDraggingInSameColumn, setIsDraggingInSameColumn] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getItemsByColumn = (columnId: string) => {
    return items.filter((item) => item.columnId === columnId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find((i) => i.id === event.active.id);
    if (item) {
      setActiveItem(item);
      setIsDraggingInSameColumn(true);
      setActiveColumnId(item.columnId);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveColumnId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeItem = items.find((i) => i.id === activeId);
    const overItem = items.find((i) => i.id === overId);
    const isOverAColumn = columns.some((col) => col.id === overId);

    if (isOverAColumn) {
      setActiveColumnId(overId as string);
    } else if (overItem) {
      setActiveColumnId(overItem.columnId);
    }

    setIsDraggingInSameColumn(
      !!(activeItem && overItem && activeItem.columnId === overItem.columnId)
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumnId(null);
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      setActiveItem(null);
      return;
    }

    const overItem = items.find((i) => i.id === overId);
    const overItemColumnId = overItem?.columnId;

    const activeItem = items.find((i) => i.id === activeId);
    const isOverAColumn = columns.some((col) => col.id === overId);
    const overItemColumnIsDifferent = overItemColumnId !== activeItem?.columnId;

    if (activeItem && (isOverAColumn || overItemColumnIsDifferent)) {
      const newColumnId = isOverAColumn ? overId : overItemColumnId;
      if (!newColumnId) return;

      const newItems = onItemChange?.({
        itemId: activeItem.id,
        oldColumnId: activeItem.columnId,
        newColumnId: newColumnId as T['columnId'],
      });

      if (newItems) {
        setItems(newItems);
      }
    }

    setActiveItem(null);
  };

  return {
    items,
    activeItem,
    isDraggingInSameColumn,
    activeColumnId,
    sensors,
    getItemsByColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
