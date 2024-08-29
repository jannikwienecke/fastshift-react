type ComboxboxItem = {
  id: string | number;
  label: string;
};

export type ComboboxPopoverProps = {
  input: {
    query: string;
    placeholder: string;
    onChange: (query: string) => void;
    onBlur?: () => void;
  };

  values: ComboxboxItem[];
  onChange: (value: ComboxboxItem) => void;
  selected: ComboxboxItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  render: (value: ComboxboxItem) => React.ReactNode;
  multiple: boolean;
};

export type ComboboxGetPropsOptions = {
  onSelect: (props: {
    value: ComboxboxItem;
    rowId: string | number;
    fieldName: string;
  }) => void;
};

export type ComboboAdapterProps = {
  name: string;
  fieldName: string;
  connectedRecordId: string | number;
  selectedValue: {
    id: string | number;
    label: string;
  };
};
