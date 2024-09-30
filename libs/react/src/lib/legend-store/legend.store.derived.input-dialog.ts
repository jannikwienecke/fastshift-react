import { FieldConfig, RecordType } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { InputDialogValueDict } from '../ui-adapter/input-dialog';
import { store$ } from './legend.store';

export type InputDialogProps = {
  open: boolean;
  title: string;
  className?: string;
  inputList: {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }[];
};

export const DEFAULT_DIALOG_PROPS: InputDialogProps = {
  open: false,
  title: '',
  inputList: [],
};

export type MakeInputDialogProps<T extends RecordType = RecordType> = {
  onSave?: (valueDict: InputDialogValueDict<T>) => void;
  onCancel?: () => void;
  defaultValue?: InputDialogValueDict<T>;
  titleFn?: (props: { field: FieldConfig }) => string;
};

export const inputDialogProps = observable(
  {} as MakeInputDialogProps | undefined
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
  ] satisfies InputDialogProps['inputList'];

  const titleFn = inputDialogProps?.titleFn?.get();
  return {
    open: true,
    title: titleFn
      ? titleFn({ field: filterField })
      : 'Filter by ' + filterField.name,
    inputList,
  } satisfies InputDialogProps;
});
