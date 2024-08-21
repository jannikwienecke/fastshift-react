import { RecordType, storeAtom } from '@apps-next/core';
import { atom } from 'jotai';
import { viewConfigManagerAtom } from '../../use-view';
import { FORM_DEFAULT_VALUE_DICT, FORM_INPUT_DICT } from './form.config';
import { FormField, FormProps, StringInput } from '@apps-next/ui';

const INITIAL: FormProps<any> = {
  fields: [],
  show: false,
  record: {},
  dirty: false,
  ready: true,
};

export const initialFormAtom = atom<FormProps<any>>(INITIAL);

export const formAtom = atom(INITIAL, (get, set) => {
  const editState = get(storeAtom).edit;
  const viewConfigManager = get(viewConfigManagerAtom);

  const fields: FormField<RecordType>[] =
    viewConfigManager?.form.getFormFieldList().map((field) => {
      const { relation, isRequired } = field;
      const name = relation ? relation.tableName : field.name;

      const defaultValue = isRequired
        ? FORM_DEFAULT_VALUE_DICT[field.type] || ''
        : undefined;

      const Component = FORM_INPUT_DICT[field.type] || StringInput;

      return {
        name,
        required: field.isRequired || false,
        type: field.type,
        placeholder: `Enter ${name}`,
        value: editState.record?.[name] || defaultValue || undefined,
        Component: Component,
        onChange: (value: unknown) => {
          console.log('onChange:', value);

          const formState = get(initialFormAtom);
          const noValue = value === null || value === '' || value === undefined;

          const isRequiredError = field.isRequired && noValue;
          formState.ready = isRequired ? false : true;

          const error: FormField<RecordType>['error'] | undefined =
            formState.ready
              ? undefined
              : {
                  message: isRequiredError ? `Field ${name} is required` : '',
                };

          set(initialFormAtom, {
            ...formState,
            dirty: true,
            fields: formState.fields.map((field) => {
              if (field.name === name) {
                return {
                  ...field,
                  value,
                  error,
                };
              }
              return field;
            }),
          });
        },
      };
    }) || [];

  set(initialFormAtom, {
    fields,
    show: editState.isEditing,
    record: editState.record,
    dirty: false,
    ready: true,
  });
});
