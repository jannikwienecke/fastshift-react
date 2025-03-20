import { StoreFn } from './legend.store.types';

export const datePickerDialogOpen: StoreFn<'datePickerDialogOpen'> =
  (store$) => (date, onSubmit) => {
    store$.datePickerDialogState.open.set(true);
    date && store$.datePickerDialogState.selected.set(date);

    if (onSubmit) {
      store$.datePickerDialogState.onSubmit.set({
        fn: onSubmit,
      });
    }
  };

export const datePickerDialogClose: StoreFn<'datePickerDialogClose'> =
  (store$) => () => {
    store$.datePickerDialogState.open.set(false);
    store$.datePickerDialogState.selected.set(null);
  };

export const datePickerDialogSelectDate: StoreFn<
  'datePickerDialogSelectDate'
> = (store$) => (date) => {
  store$.datePickerDialogState.selected.set(date);
};

export const datePickerDialogSubmit: StoreFn<'datePickerDialogSubmit'> =
  (store$) => () => {
    const onSubmit = store$.datePickerDialogState.onSubmit.get();
    const selectedDate = store$.datePickerDialogState.selected.get();

    if (!selectedDate) return;
    if (!onSubmit) return;

    onSubmit.fn?.(selectedDate);
  };
