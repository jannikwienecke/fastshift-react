import { RecordType } from './base.types';
import { FilterItemType } from './filter.types';

export type ComboxboxItem = {
  id: string | number | (string | number)[];
  label: string;
};

export type ListValueProps = {
  id: string | number;
  label: string;
  relation?: {
    tableName: string;
    fieldName: string;
  };
  render: () => React.ReactNode;
};

export type ListItem = {
  id: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: (props: any) => React.ReactNode;
  valuesLeft: ListValueProps[];
  valuesRight: ListValueProps[];
};

export type ListProps<TItem extends ListItem = ListItem> = {
  items: TItem[];
  onSelect: (item: TItem) => void;
  selected: Record<string, any>[];
};

export type ListGetProps<T> = {
  fieldsLeft: (keyof T)[];
  fieldsRight: (keyof T)[];
};

export type ListAdapter<T extends RecordType> = <
  Props extends ListGetProps<T>
>() => (options?: Props) => ListProps;

export type ComboboxProps = {
  inputProps: {
    query: string;
    placeholder: string;
    onChange: (query: string) => void;
    onBlur?: () => void;
  };
  listProps: {
    values: ComboxboxItem[];
    onSelectedChange: (value: ComboxboxItem) => void;
  };

  comboboxProps: {
    label: string;
    onChange: (value: ComboxboxItem) => void;
    selected: ComboxboxItem | null;
  };
};

export type ComboboxPopoverProps<T extends ComboxboxItem = ComboxboxItem> = {
  input?: {
    query: string;
    placeholder: string;
    onChange: (query: string) => void;
  };

  values: T[];
  onChange: (value: T) => void;
  selected: ComboxboxItem[] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  render: (value: T) => React.ReactNode;
  multiple: boolean;
  rect: DOMRect | null;
  searchable: boolean;
  name: string;
};

export type ComboboxAdapterOptions<T extends ComboxboxItem> = {
  onClose: () => void;
  onSelect: (props: { value: T }) => void;
};

export type ComboboAdapterProps = {
  name: string;
  fieldName: string;
  connectedRecordId: string | number;
  selectedValue: {
    id: string | number | (string | number)[];
    label: string;
  };
};

export type FilterProps = {
  filters: FilterItemType[];
  onOpen: () => void;
  onRemove: (filter: FilterItemType) => void;
  comboboxProps: ComboboxPopoverProps;
};
