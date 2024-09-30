import { FieldConfig, InputDialogProps, RecordType } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { InputDialogState, InputDialogValueDict } from './legend.store.types';

export const DEFAULT_DIALOG_PROPS: InputDialogState = {
  open: false,
  title: '',
  inputList: [],
};

export type MakeInputDialogPropsOptions<T extends RecordType = RecordType> = {
  onSave?: (valueDict: InputDialogValueDict<T>) => void;
  onCancel?: () => void;
  defaultValue?: InputDialogValueDict<T>;
  titleFn?: (props: { field: FieldConfig }) => string;
};

export const inputDialogProps = observable(
  {} as MakeInputDialogPropsOptions | undefined
);
// derived stores from main store
export const inputDialogState$ = observable<InputDialogProps>(() => {
  const filterField = store$.filter.selectedField.get();

  if (!filterField) return DEFAULT_DIALOG_PROPS;
  if (filterField.type !== 'String') return DEFAULT_DIALOG_PROPS;

  const inputList = [
    {
      id: filterField.name,
      value: store$.inputDialog.valueDict[filterField.name].get()?.value ?? '',
      onChange: (e) => {
        if (!filterField) return;

        const value = e.target.value;
        store$.inputDialog.valueDict[filterField.name].set({
          value,
          field: filterField,
        });
      },
      placeholder: filterField.name,
    },
  ] satisfies InputDialogState['inputList'];

  const titleFn = inputDialogProps?.titleFn?.get();
  return {
    open: true,
    title: titleFn
      ? titleFn({ field: filterField })
      : 'Filter by ' + filterField.name,
    inputList,
  } satisfies InputDialogState;
});
