import { TranslationKeys } from '../translations';
import { FieldConfig, RecordType } from './base.types';
import { DisplayOptionsUiType, FilterItemType } from './filter.types';

export type ComboxboxItem = {
  id: string | number | (string | number)[];
  label: string;
  icon?: React.FC<any>;
  field?: FieldConfig;
  viewName?: string;
  tablename?: string;
  // value?: unknown;
};

export type DisplayOptionsViewField = {
  id: string;
  label: string;
  name: string;
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
  deleted: boolean;
  inFocus: boolean;
  onHover: () => void;
  focusType: 'focus' | 'hover' | 'none';
};

export type ListProps<TItem extends ListItem = ListItem> = {
  // rowInFocus: Row | null;
  items: TItem[];
  onSelect: (item: TItem) => void;
  selected: Record<string, any>[];
  onKeyPress: (type: 'up' | 'down') => void;
  grouping: {
    groupByField: string;
    groupByTableName: string;
    groupLabel: string;
    groups: {
      groupById: string | number | undefined;
      groupByLabel: string;
    }[];
  };
  onReachEnd: () => void;
  onContextMenu: (item: TItem, rect: DOMRect) => void;
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
  showCheckboxInList?: boolean;
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
    displayFieldsToShow?: (keyof T)[];
  };

export type MakeContextMenuPropsOptions<T extends RecordType = RecordType> = {
  //
};

export type MakeConfirmationAlertPropsOption<
  T extends RecordType = RecordType
> = {
  //
};

export type MakeCommandbarPropsOption<T extends RecordType = RecordType> = {
  //
};

export type MakeCommandformPropsOption<T extends RecordType = RecordType> = {
  //
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
  onToggleShowDeleted: (checked: boolean) => void;
  showEmptyGroupsToggle: boolean;
  showEmptyGroups: boolean;

  onReset: () => void;
  showResetButton: boolean;

  sorting: {
    onOpen: (rect: DOMRect) => void;
    onClose: () => void;
    toggleSorting: () => void;
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
  renderFilterValue: (filterValue: FilterItemType) => React.ReactNode;
};

export type ConfirmationDialogProps = {
  open: boolean;
  title?: TranslationKeys;
  description?: TranslationKeys;
  onSubmit?: () => void;
  onCancel: () => void;
  onClose: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};

export type CommandformItem = ComboxboxItem & {
  // render: () => React.ReactNode;
};

export type FormErrors = { [fieldName: string]: { error: string } };

export type CommandformProps = {
  open?: boolean;
  formState: {
    isReady: boolean;
    errors: FormErrors;
  };
  onClose: () => void;
  complexFields: CommandformItem[];
  primitiveFields: CommandformItem[];
  render: (field: CommandformItem) => React.ReactNode;
  onClick: (field: CommandformItem, rect: DOMRect) => void;
  onInputChange: (field: CommandformItem, value: string) => void;
  onSubmit: () => void;
  onCheckedChange: (field: CommandformItem, checked: boolean) => void;

  // onOpen: () => void;
};

export type CommandbarProps = {
  open?: boolean;
  itemGroups?: Array<ComboxboxItem[]>;
  groupLabels?: string[];
  headerLabel: string;
  inputPlaceholder: string;
  query?: string;

  renderItem: (
    item: ComboxboxItem,
    active: boolean,
    index: number
  ) => React.ReactNode;

  onClose: () => void;
  onOpen: () => void;
  onSelect: (item: ComboxboxItem) => void;
  onValueChange: (item: ComboxboxItem) => void;
  onInputChange: (query: string) => void;
};

export type DatePickerDialogProps = {
  title: string;
  fieldLabel: string;
  description: string;
  open: boolean;
  selectedDate: Date | null;
  defaultDate?: Date | undefined;
  submitBtnLabel?: string;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  onSubmit: () => void;
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
