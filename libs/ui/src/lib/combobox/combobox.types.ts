export type ComboxboxItem = {
  id: string | number;
  label: string;
};

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
