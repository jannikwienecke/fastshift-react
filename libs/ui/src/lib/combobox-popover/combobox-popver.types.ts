import { ComboxboxItem } from '../combobox/combobox.types';

export type ComboboxPopoverProps = {
  input: {
    query: string;
    placeholder: string;
    onChange: (query: string) => void;
  };

  values: ComboxboxItem[];
  onChange: (value: ComboxboxItem) => void;
  selected: ComboxboxItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  render: (value: ComboxboxItem) => React.ReactNode;
  multiple: boolean;
  rect: DOMRect | null;
};

export type ComboboxAdapterOptions = {
  onClose: () => void;
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
    id: string | number | (string | number)[];
    label: string;
  };
};
