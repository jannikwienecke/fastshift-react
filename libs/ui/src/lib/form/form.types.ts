import React from 'react';
import { ComboboxProps } from '../combobox';

export type FormRecord = Record<any, any>;

export type FormField<T extends FormRecord> = {
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
    useCombobox?: (props: {
      tableName: string;
      query?: string;
    }) => () => ComboboxProps;
  };
  enum?: {
    fieldName: string;
    values: {
      name: string;
    }[];
  };
};

export type FormProps<T extends FormRecord> = {
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
