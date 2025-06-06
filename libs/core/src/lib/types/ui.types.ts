import { RelationalFilterDataModel, Row } from '../data-model';
import { TranslationKeys } from '../translations';
import { FieldConfig, RecordType } from './base.types';
import { CommandHeader, CommandName } from './commands';
import {
  DisplayOptionsUiType,
  FilterItemType,
  UserViewForm,
} from './filter.types';
import { HistoryType } from './history.types';
import { UserViewData } from './query.types';
import { ViewConfigType } from './view-config.types';

export type ComboxboxItem = {
  id: string | number | (string | number)[];
  label: string;
  icon?: React.FC<any>;
  field?: FieldConfig;
  viewName?: string;
  tablename?: string;
  value?: unknown;
  rowValue?: Row;
  rowValues?: Row[];
  render?: (active: boolean, index: number) => React.ReactNode;
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
  onClick: (item: TItem) => void;
  selected: Record<string, any>[];
  onKeyPress: (type: 'up' | 'down') => void;
  grouping: {
    groupByField: string;
    groupByTableName: string;
    groupLabel: string;
    groupIcon?: React.FC<any>;
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
  onClickRelation?: (field: FieldConfig, row: Row, cb: () => void) => void;
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
  onClickCreateNew: (value: string) => void;
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

export type MakeRightSidebarOption<T extends RecordType = RecordType> = {
  //
};

export type MakeDetailPropsOption<T extends RecordType = RecordType> = {
  onClickRelation?: (field: FieldConfig, row: Row, cb: () => void) => void;
};

export type MakePageHeaderPropsOption<T extends RecordType = RecordType> = {
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

export type SaveViewDropdownProps = {
  onSave: () => void;
  onSaveAsNewView: () => void;
  onReset: () => void;
  show: boolean;
  form?: UserViewForm & {
    emoji?: Emoji | null;
    onSave: () => void;
    onCancel: () => void;
    onNameChange: (name: string) => void;
    onEmojiChange: (emoji: Emoji) => void;
    onDescriptionChange: (description: string) => void;
  };
};

export type CommandsDropdownProps = {
  onOpenCommands: (open: boolean) => void;
  onSelectCommand: (command: CommandbarItem) => void;
  commands: {
    header?: string;
    items: (CommandbarItem & ComboxboxItem)[];
  }[];
  children?: React.ReactNode;
};

export type PageHeaderProps = {
  onToggleFavorite: () => void;
  commandsDropdownProps: CommandsDropdownProps;
  starred: boolean;
  viewName: string;
  icon?: React.FC<any>;
  emoji?: Emoji | null;
  detail?: {
    label: string;
    onClickParentView: () => void;
  } & DetailPageProps;

  commands: {
    commandsDropdownProps?: CommandsDropdownProps;
    primaryCommand?: CommandbarItem | null;
  };

  query?: {
    showInput: boolean;
    query: string;

    onBlur: () => void;
    onToggleRightSidebar?: () => void;
    toggleShowInput: () => void;
    onChange: (query: string) => void;
  };
};

export type RightSidebarProps = {
  isOpen: boolean;
  viewName: string;
  viewIcon: React.FC<any>;
  tableName: string;

  commandsDropdownProps: CommandsDropdownProps;
  starred: boolean;

  onClose: () => void;
  onToggleFavorite: () => void;

  tabs: {
    listRows: Row[];
    listQueryIsDone: boolean;
    relationalFilterData: RelationalFilterDataModel;
    query: string;
    activeTab: string;
    currentFilter?: { id?: string | null; tableName?: string | null } | null;

    onTabChange: (tab: string) => void;
    onQueryChange: (query: string) => void;
    setFilter: (filter?: { id: string; tableName: string }) => void;
    getView: (tableName: string) => ViewConfigType | undefined;
    getUserView: (name: string) => UserViewData | undefined;
    getTabProps: (tab: string) => {
      icon: React.FC<any> | undefined;
      ids: string[];
      getCountForRow: (row: Row) => number;
      shouldNotRender: (row: Row) => boolean;
    };
  };
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

export type FormFieldMethod = {
  onClick: (
    field: CommandformItem,
    rect: DOMRect,
    tabFormField?: boolean,
    isGoToClicked?: boolean
  ) => void;
  onClickGoToRelation: (field: CommandformItem, row: Row) => void;
  onInputChange: (
    field: CommandformItem,
    value: string,
    isTabField?: boolean
  ) => void;
  onBlurInput: (field: CommandformItem, isTabField?: boolean) => void;
  onSubmit: () => void;
  onCheckedChange: (
    field: CommandformItem,
    checked: boolean,
    isTabField?: boolean
  ) => void;
  onEnter: (field: CommandformItem, isTabField?: boolean) => void;
};

export type FormFieldProps = {
  field: CommandformItem;
  formState?: FormState | null;
  tabFormField?: boolean;
} & FormFieldMethod;

export type RecordErrors = { [fieldName: string]: { error: string } };

export type FormState = {
  isReady: boolean;
  isFieldReady: (field: FieldConfig) => boolean;
  errors: RecordErrors;
};

export type CommandformProps = {
  open?: boolean;
  formState: FormState;
  errors: string[];
  complexFields: CommandformItem[];
  primitiveFields: CommandformItem[];
  type: 'create' | 'edit';
  viewName: string;
  tableName: string;
  onClose: () => void;
  render: (field: CommandformItem) => React.ReactNode;
  onClick: (field: CommandformItem, rect: DOMRect) => void;
  onInputChange: (field: CommandformItem, value: string) => void;
  onSubmit: () => void;
  onCheckedChange: (field: CommandformItem, checked: boolean) => void;
};

export type DetailViewTypeState =
  | { type: 'overview' }
  | {
      type: 'model';
      model: string;
    };

export type DetailPageProps = {
  row: Row;
  icon?: React.FC<any>;
  formState?: FormState | null;
  propertyFields: CommandformItem[];
  primitiveFields: CommandformItem[];
  displayField: CommandformItem | undefined;
  type: 'create' | 'edit';
  viewName: string;
  tableName: string;
  relationalListFields: CommandformItem[];
  currentRelationalListField: CommandformItem | null;
  viewTypeState: DetailViewTypeState;
  emoji: Emoji | null;

  commands: {
    commandsDropdownProps: CommandsDropdownProps;
    primaryCommand?: CommandbarItem | null;
  };

  tabs: {
    detailTabsFields: CommandformItem[];
    activeTabField: CommandformItem | null | undefined;
    activeTabPrimitiveFields: CommandformItem[];
    activeTabComplexFields: CommandformItem[];
    isHistoryTab: boolean;
    historyData: HistoryType[];
    onSelectTab: (field: CommandformItem) => void;
    onClickGoToRelation: () => void;
    onSelectHistoryTab: () => void;
  } | null;

  onSelectEmoji: (emoji: Emoji) => void;
  onSelectView: (props: DetailViewTypeState) => void;
  onHoverRelationalListField: (field: CommandformItem) => void;
} & FormFieldMethod;

export type CommandbarItemHandler = (options: {
  row?: Row | undefined | null;
  field?: FieldConfig | undefined;
  value: ComboxboxItem | undefined;
}) => void;

export type CommandbarItem = Omit<ComboxboxItem, 'label' | 'viewName'> & {
  header?: CommandHeader | (() => string);
  label:
    | TranslationKeys
    | (string & {
        //
      });

  getLabel?: () => string;
  command: CommandName;
  getViewName?: () => string;
  getIsVisible?: () => boolean;
  handler?: CommandbarItemHandler;
  options?: {
    keepCommandbarOpen?: boolean;
  };

  onCheckedChange?: (checked: boolean) => void;
  subCommands?: CommandbarItem[];
  dropdownOptions?: {
    showDivider?: boolean;
  };
  primaryCommand?: boolean;
  primaryCommandOptions?: {
    style?: {
      type?: 'success' | 'danger';
    };
  };
  requiredRow?: boolean;
  allowMultiple?: boolean;
  rows?: Row[];
  priority?: number;
};

export type CommandbarProps = {
  open?: boolean;
  groups: {
    header: string;
    items: (CommandbarItem & ComboxboxItem)[];
  }[];
  activeItem?: ComboxboxItem | null;
  headerLabel: string;
  inputPlaceholder: string;
  query?: string;
  error?: {
    message: string;
    showError: boolean;
  };
  row?: Row;

  renderItem: (
    item: ComboxboxItem,
    active: boolean,
    index: number,
    row?: Row
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

export type Emoji = {
  label: string;
  emoji: string;
};
