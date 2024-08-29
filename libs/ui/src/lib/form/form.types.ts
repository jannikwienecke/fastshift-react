import React from 'react';
import {
  ComboboAdapterProps,
  ComboboxAdapterOptions,
  ComboboxPopoverProps,
} from '../combobox-popover';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormRecord = Record<any, any>;

export type FormField<T extends FormRecord = FormRecord> = {
  name: keyof T;
  required: boolean;
  placeholder: string;
  value: T[keyof T] | undefined;
  Component: React.FC<FormFieldProps<T>>;
  onChange: (value: T[keyof T]) => void;
  error?: {
    message: string;
  };
  relation?: {
    tableName: string;
    fieldName: string;
    useCombobox: (
      props: ComboboAdapterProps
    ) => (options?: ComboboxAdapterOptions) => ComboboxPopoverProps;
  };
  enum?: {
    fieldName: string;
    values: {
      name: string;
    }[];
  };
};

export type FormProps<T extends FormRecord = any> = {
  fields: FormField<T>[];
  show: boolean;
  record: T | null;
  dirty: boolean;
  ready: boolean;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
};

export type FormFieldProps<T extends FormRecord> = Omit<
  FormField<T>,
  'Component'
>;
