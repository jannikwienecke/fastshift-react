export interface IBaseItem {
  id: string;
  columnId: string;
  [key: string]: any; // Allow for additional properties
}

export interface IColumn {
  id: string;
  label: string;
}

// Legacy interfaces for backward compatibility
export type TStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface ITask extends IBaseItem {
  title: string;
  description?: string;
}

export type RenderItemProps<T extends IBaseItem> = {
  item: T;
  isPreview: boolean;
  isOverlay: boolean;
  isDraggingInSameColumn: boolean;
};

export type OnItemChangeProps<T extends IBaseItem> = {
  itemId: T['id'];
  oldColumnId: T['columnId'];
  newColumnId: T['columnId'];
};

export interface IKanbanBoardProps<T extends IBaseItem> {
  data: {
    items: T[];
    columns: IColumn[];
  };
  callbacks: {
    onItemsChange?: (items: T[]) => void;
    renderItem: (props: RenderItemProps<T>) => React.ReactNode;
  };
}

export interface UseKanbanBoardProps<T extends IBaseItem> {
  initialItems: T[];
  columns: IColumn[];
  onItemChange?: (props: OnItemChangeProps<T>) => T[];
}

export interface IColumnProps<T extends IBaseItem> {
  column: {
    id: string;
    label: string;
    items: T[];
  };
  activeId: string | null;
  isDraggingInSameColumn: boolean;
  isOver?: boolean;
  renderItem: (props: RenderItemProps<T>) => React.ReactNode;
}
