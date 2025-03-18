import { makeDayMonthString } from '@apps-next/core';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../utils';

export type DateItemProps = {
  value?: number;
};

export const DateItem = (props: DateItemProps) => {
  const { value: dueDate } = props;
  if (!dueDate) return null;

  const date = new Date(dueDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isInTheNext7Days =
    date.getTime() >= today.getTime() &&
    date.getTime() < new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

  const isOverdue = date.getTime() < today.getTime();

  return (
    <div className="flex flex-row items-center gap-1 border border-foreground/10 rounded-lg px-1 p-1">
      <div>
        <CalendarIcon
          className={cn(
            'w-4 h-4',
            isInTheNext7Days
              ? 'text-orange-500'
              : isOverdue
              ? 'text-red-500'
              : 'text-foreground/80'
          )}
        />
      </div>
      <span className="text-xs text-foreground/80">
        {makeDayMonthString(date)}
      </span>
    </div>
  );
};

export const DateListItem = (props: { data: string }) => {
  return (
    <div className="flex items-center gap-1">
      <div>
        <CalendarIcon className="w-4 h-4" />
      </div>
      <div>{props.data}</div>
    </div>
  );
};
