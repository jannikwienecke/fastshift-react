import {
  DatePickerDialogProps,
  TranslationKeys,
  useTranslation,
} from '@apps-next/core';
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '../components';
import React from 'react';

function Default({ open, ...props }: DatePickerDialogProps) {
  const { t } = useTranslation();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const onCloseRef = React.useRef(props.onClose);
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const dateToShow = props.selectedDate ?? props.defaultDate ?? tomorrow;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{props.title || 'Select a date'}</DialogTitle>

          <DialogDescription>{props.description ?? ''}</DialogDescription>
        </DialogHeader>

        <Input
          type="date"
          className="justify-center clean-input border"
          value={dateToShow.toISOString().split('T')[0]}
          onChange={(e) => props.onSelectDate?.(new Date(e.target.value))}
        />

        <div className="flex flex-row items-center justify-evenly">
          <Calendar
            initialFocus
            mode="multiple"
            numberOfMonths={2}
            onSelect={(days) => {
              const day = days?.[1];
              day && props.onSelectDate?.(day);
            }}
            selected={[dateToShow]}
            classNames={{
              day_selected:
                'bg-primary/90 text-primary-foreground hover:border hover:bg-primary hover:text-primary-foreground',
            }}
          />
        </div>

        <DialogFooter>
          <Button onClick={props.onSubmit} className="w-full" type="submit">
            {props.submitBtnLabel
              ? t(props.submitBtnLabel as TranslationKeys)
              : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const datePickerModal = {
  default: Default,
};
