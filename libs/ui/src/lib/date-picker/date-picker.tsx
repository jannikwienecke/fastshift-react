'use client';

import { DatePickerProps } from '@apps-next/core';
import {
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components';

export function DatePicker({
  selected,
  onSelect,
  rect,
  open,
  onOpenChange,
}: DatePickerProps) {
  if (!rect) return null;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          style={{
            position: 'fixed',
            top: `${rect.top + rect.height}px`,
            left: `${rect.left + 250 / 2}px`,
          }}
        />
      </PopoverTrigger>

      <PopoverContent data-testid="date-picker" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => date && onSelect(date)}
          initialFocus={true}
        />
      </PopoverContent>
    </Popover>
  );
}
