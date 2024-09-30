import { ComboxboxItem, FieldConfig, RecordType } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { viewConfigManagerAtom } from '../../stores';

export type InputDialogValueDict<T extends RecordType = RecordType> = Partial<
  Record<
    keyof T,
    {
      value: string;
      field?: FieldConfig | null;
    }
  >
>;

type InputDialogState<T extends RecordType = RecordType> = {
  field: FieldConfig | null;
  valueDict: InputDialogValueDict<T>;
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
    valueDict: {},
  });
});

export const useInputDialogStore = () => {
  const state = useAtomValue(inputDialogStateAtom);
  const setField = useSetAtom(setFieldAtom);
  const updateValue = useSetAtom(updateValueAtom);

  const viewConfigManager = useAtomValue(viewConfigManagerAtom);

  const close = useSetAtom(closeAtom);

  const handleSelectFromFilter = (value: ComboxboxItem) => {
    try {
      const field = viewConfigManager?.getFieldBy(value.id.toString());
      if (field?.type === 'String') {
        setField(field);
      }
    } catch (error) {
      //
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
