import {
  DatePickerDialogProps,
  getFieldLabel,
  t,
  TranslationKeys,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const derviedDatePickerDialogState$ = observable(() => {
  const field = store$.commandbar.selectedViewField.get();

  const title = field
    ? t('common.editName' satisfies TranslationKeys, {
        name: getFieldLabel(field, true),
      })
    : '';

  const submitBtnLabel = field
    ? t('common.saveField' satisfies TranslationKeys, {
        name: getFieldLabel(field, true),
      })
    : '';

  return {
    ...store$.datePickerDialogState.get(),
    title,
    description: t('datePicker.description' satisfies TranslationKeys),
    fieldLabel: field ? getFieldLabel(field, true) : '',
    submitBtnLabel,
    selectedDate: store$.datePickerDialogState.selected.get(),
    onClose: () => store$.datePickerDialogClose(),
    onSelectDate: (date) => store$.datePickerDialogSelectDate(date),
    onSubmit: () => store$.datePickerDialogSubmit(),
  } satisfies DatePickerDialogProps;
});
