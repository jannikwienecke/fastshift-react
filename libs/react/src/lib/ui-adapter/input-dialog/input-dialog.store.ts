import { ComboxboxItem, FieldConfig } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { viewConfigManagerAtom } from '../../stores';

export type InputDialogValueDict = Record<
  string,
  {
    value: string;
    field?: FieldConfig | null;
  }
>;

type InputDialogState = {
  field: FieldConfig | null;
  valueDict: InputDialogValueDict;
  open: boolean;
};

const inputDialogStateAtom = atom<InputDialogState>({
  field: null,
  valueDict: {},
  open: false,
});

const setFieldAtom = atom(null, (get, set, field: FieldConfig) => {
  set(inputDialogStateAtom, {
    ...get(inputDialogStateAtom),
    field,
    open: true,
  });
});

const updateValueAtom = atom(
  null,
  (get, set, props: { name: string; value: string }) => {
    const field = get(inputDialogStateAtom).field;
    set(inputDialogStateAtom, {
      ...get(inputDialogStateAtom),
      valueDict: {
        ...get(inputDialogStateAtom).valueDict,
        [props.name]: {
          value: props.value,
          field: field?.name === props.name ? field : null,
        },
      },
    });
  }
);

const closeAtom = atom(null, (get, set) => {
  set(inputDialogStateAtom, {
    ...get(inputDialogStateAtom),
    field: null,
    open: false,
  });
});

export const useInputDialogStore = () => {
  const state = useAtomValue(inputDialogStateAtom);
  const setField = useSetAtom(setFieldAtom);
  const updateValue = useSetAtom(updateValueAtom);

  const viewConfigManager = useAtomValue(viewConfigManagerAtom);

  const close = useSetAtom(closeAtom);

  const handleSelectFromFilter = (value: ComboxboxItem) => {
    const field = viewConfigManager?.getFieldBy(value.id.toString());
    if (!field) return;
    if (field.type !== 'String') {
      return;
    }
  };

  return {
    state,
    setField,
    updateValue,
    handleSelectFromFilter,
    close,
  };
};
