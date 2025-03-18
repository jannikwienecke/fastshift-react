import {
  ConfirmationDialogProps,
  MakeConfirmationAlertPropsOption,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const confirmationAlertProps = observable<
  Partial<MakeConfirmationAlertPropsOption>
>({});

export const derivedConfirmationAlert$ = observable(() => {
  return {
    ...store$.confirmationAlert.get(),
    open: !!store$.confirmationAlert.get()?.open,
    onSubmit: () => {
      const cb = store$.confirmationAlert.get()?.onConfirm?.cb;
      cb && (cb as () => void)?.();
    },
    onCancel: () => store$.confirmationAlert.set(undefined),
    onClose: () => store$.confirmationAlert.set(undefined),
    title: store$.confirmationAlert.get()?.title,
    description: store$.confirmationAlert.get()?.description,
  } satisfies ConfirmationDialogProps;
});
