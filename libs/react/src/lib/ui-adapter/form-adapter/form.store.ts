import {
  ID,
  MutationProps,
  MutationReturnDto,
  RecordType,
  storeAtom,
} from '@apps-next/core';
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
  isSubmitting: false,
  onSubmit: () => null,
};

export const initialFormAtom = atom<FormProps<any>>(INITIAL);

export const formAtom = atom(
  INITIAL,
  (
    get,
    set,
    update: {
      onSubmit: (
        props: MutationProps['mutation']
      ) => Promise<MutationReturnDto>;
    }
  ) => {
    const editState = get(storeAtom).edit;
    const viewConfigManager = get(viewConfigManagerAtom);

    const fields: FormField<RecordType>[] =
      viewConfigManager?.form.getFormFieldList().map((field) => {
        const { relation, isRequired, isRelationalIdField } = field;
        const name = relation ? relation.tableName : field.name;

        const defaultValue = isRequired
          ? FORM_DEFAULT_VALUE_DICT[field.type]
          : undefined;

        const Component = FORM_INPUT_DICT[field.type] || StringInput;

        return {
          name,
          required: field.isRequired || false,
          type: field.type,
          placeholder: `Enter ${name}`,
          value: editState.record?.[name] || defaultValue || undefined,
          Component: Component,
          relation: field.relation,
          isRelationalIdField,
          onChange: (value: unknown) => {
            const formState = get(initialFormAtom);
            const noValue =
              value === null || value === '' || value === undefined;

            const isRequiredError = field.isRequired && noValue;
            formState.ready = isRequiredError ? false : true;

            const error: FormField<RecordType>['error'] | undefined =
              formState.ready
                ? undefined
                : {
                    message: isRequiredError ? `Field ${name} is required` : '',
                  };

            set(initialFormAtom, {
              ...formState,
              ready: formState.ready,
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
      isSubmitting: false,
      onSubmit: async () => {
        if (!editState.record) return;

        const formState = get(initialFormAtom);
        const record = formState.fields.reduce((acc, field) => {
          acc[field.relation?.fieldName || (field.name as keyof RecordType)] =
            field.value;
          return acc;
        }, {} as RecordType);

        set(storeAtom, {
          ...get(storeAtom),
          edit: {
            ...get(storeAtom).edit,
            isEditing: false,
            record: null,
          },
        });

        set(initialFormAtom, {
          ...formState,
          ready: false,
          isSubmitting: true,
        });

        const res = await update.onSubmit({
          type: 'UPDATE_RECORD',
          record: record,
          id: editState.record.id,
          handler: (items) => {
            return items.map((item) => {
              if (item.id === editState.record?.id) {
                return record;
              }
              return item;
            });
          },
        });

        if (res.succes) {
          set(initialFormAtom, {
            ...formState,
            ready: true,
            isSubmitting: false,
          });

          set(storeAtom, {
            ...get(storeAtom),
            edit: {
              ...get(storeAtom).edit,
              isEditing: false,
              record: null,
            },
          });
        } else {
          set(initialFormAtom, {
            ...formState,
            ready: false,
            isSubmitting: false,
          });

          set(storeAtom, {
            ...get(storeAtom),
            edit: {
              ...get(storeAtom).edit,
              isEditing: true,
              record: editState.record,
            },
          });
        }
      },
    });
  }
);
