import React from 'react';

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
};

export type FormProps<T extends FormRecord> = {
  fields: FormField<T>[];
  show: boolean;
  record: T | null;
  dirty: boolean;
  ready: boolean;
};

export type FormFieldProps<T extends FormRecord> = Omit<
  FormField<T>,
  'Component'
>;
