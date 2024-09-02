import { ComboxboxItem } from '../combobox/combobox.types';

export type ComboboxPopoverProps<T extends ComboxboxItem = ComboxboxItem> =
  | {
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
    }
  | undefined
  | null;

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
