'use client';

import * as React from 'react';
import { cn } from '../utils';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components';
import { DatePickerProps } from '@apps-next/core';

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
      {/* <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !selected && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger> */}

      <PopoverTrigger asChild>
        <div
          style={{
            position: 'fixed',
            top: `${rect.top + rect.height}px`,
            left: `${rect.left - rect.width / 2}px`,
            width: `${0}px`,
            height: `${0}px`,
          }}
        />
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
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
