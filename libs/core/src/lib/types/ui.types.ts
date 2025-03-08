import { RecordType } from './base.types';
import { DisplayOptionsUiType, FilterItemType } from './filter.types';

export type ComboxboxItem = {
  id: string | number | (string | number)[];
  label: string;
  icon?: React.FC<any>;
};

export type DisplayOptionsViewField = {
  id: string;
  label: string;
  selected: boolean;
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

  grouping: {
    groupByField: string;
    groupLabel: string;
    groups: {
      groupById: string | number | undefined;
      groupByLabel: string;
    }[];
  };
  onReachEnd: () => void;
};

export type MakeListPropsOptions<T = RecordType> = {
  fieldsLeft: (keyof T)[];
  fieldsRight: (keyof T)[];
};

export type ListAdapter<T extends RecordType> = <
  Props extends MakeListPropsOptions<T>
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
  datePickerProps?: DatePickerProps;
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

export type MakeFilterPropsOptions<T extends RecordType = RecordType> = {
  hideFields: (keyof T)[];
  placeholder?: string;
  label?: string;
};

export type MakeDisplayOptionsPropsOptions<T extends RecordType = RecordType> =
  {
    placeholder?: string;
    label?: string;
    sorting: {
      defaultSortingField: keyof T;
    };
    displayFieldsToShow?: (keyof T)[];
  };

export type DisplayOptionsProps = {
  label: string;
  onOpen: (rect: DOMRect) => void;
  onClose: () => void;

  viewType: {
    //
  } & DisplayOptionsUiType['viewType'];

  viewFields: DisplayOptionsViewField[];
  onSelectViewField: (field: DisplayOptionsViewField) => void;

  onToggleShowEmptyGroups: (checked: boolean) => void;
  showEmptyGroupsToggle: boolean;
  showEmptyGroups: boolean;

  sorting: {
    onOpen: (rect: DOMRect) => void;
    onClose: () => void;
  } & DisplayOptionsUiType['sorting'];

  grouping: {
    onOpen: (rect: DOMRect) => void;
    onClose: () => void;
  } & DisplayOptionsUiType['grouping'];
  // onSelect: (filter: FilterItemType, rect: DOMRect) => void;
} & Omit<DisplayOptionsUiType, 'sorting' | 'viewType'>;

export type FilterProps = {
  label?: string;
  filters: FilterItemType[];
  onOpen: (rect: DOMRect) => void;
  onRemove: (filter: FilterItemType) => void;
  onSelect: (filter: FilterItemType, rect: DOMRect) => void;
  onOperatorClicked: (filter: FilterItemType, rect: DOMRect) => void;
};

export type InputDialogProps = {
  open: boolean;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
  onOpenChange: (open: boolean) => void;
  className?: string;
  inputList: {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }[];
};

export type DatePickerProps = {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  rect: DOMRect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
