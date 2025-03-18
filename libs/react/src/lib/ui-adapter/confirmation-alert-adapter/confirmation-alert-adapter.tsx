import {
  ConfirmationDialogProps,
  MakeConfirmationAlertPropsOption,
  RecordType,
} from '@apps-next/core';
import {
  confirmationAlertProps,
  derivedConfirmationAlert$,
} from '../../legend-store/legend.confirmationalert.derived';

export const makeConfirmationAlertProps = <T extends RecordType>(
  options?: MakeConfirmationAlertPropsOption<T>
): ConfirmationDialogProps => {
  confirmationAlertProps.set(options ?? {});

  return {
    ...derivedConfirmationAlert$.get(),
  };
};
