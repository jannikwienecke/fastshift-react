import { RecordType } from '@apps-next/core';
import { FormField, FormProps } from '@apps-next/ui';

export const formFieldHelper = (field: FormField) => {
  const updateRecord = (record: RecordType) => {
    record[field.relation?.fieldName || (field.name as keyof RecordType)] =
      field.relation && field.value?.id
        ? field.value.id
        : field.relation
        ? undefined
        : field.value;

    return record;
  };

  return {
    updateRecord,
  };
};

export const formHelper = (form: FormProps) => {
  const updateFields = (fieldName: string, newState: unknown) => {
    return form.fields.map((field) => {
      if (field.name === fieldName)
        return {
          ...field,
          value: newState,
        };

      return field;
    });
  };

  return {
    updateFields,
  };
};
