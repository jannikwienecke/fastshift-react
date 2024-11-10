import { cn } from '@apps-next/ui';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { IBaseItem, IColumnProps } from './types';

export function Column<T extends IBaseItem>({
  column,
  activeId,
  isDraggingInSameColumn,
  isOver,
  renderItem,
}: IColumnProps<T>) {
  const { id, label, items } = column;

  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="w-80 bg-gray-100 rounded-lg p-4 flex flex-col relative">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>

      <div
        ref={setNodeRef}
        className={cn('relative flex-1 rounded-md bg-gray-200')}
      >
        {items.map((item) => (
          <div key={item.id} className="relative z-10">
            {renderItem({
              item,
              isPreview: activeId === item.id,
              isOverlay: false,
              isDraggingInSameColumn,
            })}
          </div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOver ? 1 : 0 }}
          transition={{
            duration: isOver ? 0.4 : 0,
          }}
          className={cn(
            'absolute inset-0 bg-gray-200/90 rounded-md grid place-items-center',
            isOver ? 'z-20' : ''
          )}
        >
          Board ordered by Label
        </motion.div>
      </div>
    </div>
  );
}
