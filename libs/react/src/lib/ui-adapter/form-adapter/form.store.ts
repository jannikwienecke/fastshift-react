import {
  MutationProps,
  MutationReturnDto,
  storeAtom,
  viewConfigManagerAtom,
  viewsHelperAtom,
} from '@apps-next/core';
import { atom } from 'jotai';
import {
  UseComboboAdaper,
  useCombobox as useComboboxAdapter,
} from '../combox-adapter';
import { FormProps } from './form-adapter';
import { FORM_DEFAULT_VALUE_DICT, FORM_INPUT_DICT } from './form.config';

const INITIAL: FormProps = {
  fields: [],
  show: false,
  record: {},
  dirty: false,
  ready: true,
  isSubmitting: false,
  onSubmit: () => null,
};

export const initialFormAtom = atom<FormProps>(INITIAL);

export const formAtom = atom(
  INITIAL,
  (
    get,
    set,
    update: {
      useCombobox?: UseComboboAdaper;
      onSubmit: (
        props: MutationProps['mutation']
      ) => Promise<MutationReturnDto>;
    }
  ) => {
    const { useCombobox: useComboboxProps } = update ?? {};
    const useCombobox = useComboboxProps ?? useComboboxAdapter;

    const editState = get(storeAtom).edit;
    const viewConfigManager = get(viewConfigManagerAtom);

    const fields: any[] =
      viewConfigManager?.form.getFormFieldList().map((field) => {
        const { relation, isRequired, isRelationalIdField } = field;
        const name = relation ? relation.tableName : field.name;

        let value = editState.record?.[name];

        let defaultValue = isRequired
          ? FORM_DEFAULT_VALUE_DICT[field.type]
          : field.type === 'String'
          ? ''
          : undefined;

        const Component = FORM_INPUT_DICT[field.type] || (() => null);

        if (field.enum && !defaultValue) {
          defaultValue = field.enum.values?.[0]?.name;
        }

        if (relation) {
          const relationDisplayField = get(viewsHelperAtom).getDisplayField(
            relation.tableName
          );

          value = {
            id: editState.record?.[relation.tableName]?.id,
            label:
              editState.record?.[relation.tableName]?.[relationDisplayField],
          };
        }

        return {
          name,
          required: field.isRequired || false,
          placeholder: `Enter ${name}`,
          value: value || defaultValue,

          Component: Component,
          relation: field.relation
            ? {
                ...field.relation,
              }
            : undefined,
          enum: field.enum
            ? {
                fieldName: field.name,
                values: field.enum?.values ?? [],
              }
            : undefined,
          onChange: (value: unknown) => {
            const formState = get(initialFormAtom);
            const noValue =
              value === null || value === '' || value === undefined;

            const isRequiredError = field.isRequired && noValue;
            formState.ready = isRequiredError ? false : true;

            // const error: FieldConfig['error'] | undefined =
            //   formState.ready
            //     ? undefined
            //     : {
            //         message: isRequiredError ? `Field ${name} is required` : '',
            //       };

            set(initialFormAtom, {
              ...formState,
              ready: formState.ready,
              dirty: true,
              fields: formState.fields.map((field) => {
                if (field.name === name) {
                  return {
                    ...field,
                    value,
                    error: '',
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
        const formState = get(initialFormAtom);

        // const record = formState.fields.reduce(
        //   (acc, field) => formFieldHelper(field).updateRecord(acc),
        //   {} as RecordType
        // );

        // const store = get(storeAtom);
        // set(storeAtom, {
        //   ...store,
        //   edit: {
        //     ...store.edit,
        //     isEditing: false,
        //     record: null,
        //   },
        // });

        // set(initialFormAtom, {
        //   ...formState,
        //   ready: false,
        //   isSubmitting: true,
        // });

        // let res: MutationReturnDto;

        // if (editState.record) {
        //   res = await update.onSubmit({
        //     type: 'UPDATE_RECORD',
        //     payload: {
        //       record: record,
        //       id: editState.record.id,
        //     },

        //     handler: (items) => {
        //       return items.map((item) => {
        //         if (item.id === editState.record?.id) {
        //           return record;
        //         }
        //         return item;
        //       });
        //     },
        //   });
        // } else {
        //   res = await update.onSubmit({
        //     type: 'CREATE_RECORD',
        //     payload: {
        //       id: record.id,
        //       record: record,
        //     },
        //     handler: (items) => {
        //       return [...items, record];
        //     },
        //   });
        // }

        // if (res.success?.message) {
        //   set(initialFormAtom, {
        //     ...formState,
        //     ready: true,
        //     isSubmitting: false,
        //   });
        // } else {
        //   set(initialFormAtom, {
        //     ...formState,
        //     ready: false,
        //     isSubmitting: false,
        //   });

        //   set(storeAtom, {
        //     ...store,
        //     edit: {
        //       ...store.edit,
        //       isEditing: true,
        //       record: editState.record,
        //     },
        //   });
        // }
      },
    });
  }
);

formAtom.debugLabel = 'Form Atom';
initialFormAtom.debugLabel = 'Form Record Atom';
