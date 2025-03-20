import { DatePickerDialogProps, RecordType } from '@apps-next/core';
import { derviedDatePickerDialogState$ } from '../legend-store/legend.datepickerdialog.derived';

type Props<T> = {
  // Add any specific properties for the Props type here
};
export const makeDatePickerDialogProps = <T extends RecordType>(
  options?: Props<T>
): DatePickerDialogProps => {
  return {
    ...derviedDatePickerDialogState$.get(),
  } satisfies DatePickerDialogProps;
};
