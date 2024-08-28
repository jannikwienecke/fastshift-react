import {
  ComboboAdapterProps,
  ComboboxPopoverProps,
} from '../combobox-popover/combobox-popover';

export type ListValueProps = {
  id: string | number;
  label: string;
  relation?: {
    tableName: string;
    fieldName: string;
    useCombobox: (props: ComboboAdapterProps) => () => ComboboxPopoverProps;
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
