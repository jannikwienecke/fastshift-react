import { DatePickerDialogProps } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const derviedDatePickerDialogState$ = observable(() => {
  return {
    ...store$.datePickerDialogState.get(),
    title: 'Select Date',
    description: 'Please select a date from the calendar.',
    submitBtnLabel: 'Select due date',
    selectedDate: store$.datePickerDialogState.selected.get(),
    onClose: () => store$.datePickerDialogClose(),
    onSelectDate: (date) => store$.datePickerDialogSelectDate(date),
    onSubmit: () => store$.datePickerDialogSubmit(),
  } satisfies DatePickerDialogProps;
});
