import { InputDialogProps, RecordType } from '@apps-next/core';
import { store$ } from '../../legend-store';
import {
  inputDialogState$,
  inputDialogProps,
  MakeInputDialogPropsOptions,
} from '../../legend-store/legend.store.derived.input-dialog';
import { InputDialogValueDict } from '../../legend-store';

export const makeInputDialogProps = <T extends RecordType = RecordType>(
  props?: MakeInputDialogPropsOptions<T>
): InputDialogProps => {
  inputDialogProps.set(props);

  return {
    ...inputDialogState$.get(),
    onSubmit: props?.onSave
      ? () =>
          props.onSave?.(
            store$.inputDialog.valueDict.get() as InputDialogValueDict<T>
          )
      : () => store$.inputDialogSave(),

    onCancel: props?.onCancel
      ? () => props.onCancel?.()
      : () => store$.inputDialogClose(),

    onOpenChange: (isOpen) => {
      if (!isOpen) {
        props?.onCancel ? props.onCancel?.() : store$.inputDialogClose();
      }
    },
  };
};
