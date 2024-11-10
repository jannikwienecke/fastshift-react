import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IBaseItem } from './types';

interface ITaskCardProps {
  item: IBaseItem;
  isOverlay?: boolean;
  isPreview?: boolean;
  isDraggingInSameColumn?: boolean;
}

export function KanbanCard({
  item,
  isOverlay = false,
  isPreview = false,
  isDraggingInSameColumn = false,
}: ITaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const baseClasses = 'p-4 mb-2 bg-white rounded-lg';
  const regularClasses = 'shadow cursor-move hover:shadow-md';
  const overlayClasses = 'shadow-lg rotate-[0deg] cursor-grabbing';
  const previewClasses =
    'opacity-0 border-2 border-dashed border-blue-400/30 shadow-none bg-primary/5';

  const previewSameColumnClasses =
    'opacity-0 border-2 border-dashed border-primary/30 shadow-none bg-primary/5';

  const className = `${baseClasses} ${
    isPreview && isDraggingInSameColumn
      ? previewSameColumnClasses
      : isOverlay
      ? overlayClasses
      : isPreview
      ? previewClasses
      : regularClasses
  }`;

  //   if (isPreview && !isDraggingInSameColumn) return null;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
      className={className}
    >
      <h3 className="font-medium">{item.title}</h3>
      {item.description && (
        <p className="mt-2 text-sm text-gray-600">{item.description}</p>
      )}
    </div>
  );
}
