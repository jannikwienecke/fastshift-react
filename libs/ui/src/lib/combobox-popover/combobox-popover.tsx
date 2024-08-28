'use client';

import { CheckIcon } from '@radix-ui/react-icons';
import { Input } from '../components';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../components/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/popover';
import { cn } from '../utils';

type ComboxboxItem = {
  id: string | number;
  label: string;
};

export type ComboboxPopoverProps = {
  input: {
    query: string;
    placeholder: string;
    onChange: (query: string) => void;
    onBlur?: () => void;
  };

  values: ComboxboxItem[];
  onChange: (value: ComboxboxItem) => void;
  selected: ComboxboxItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  render: (value: ComboxboxItem) => React.ReactNode;
};

export type ComboboAdapterProps = {
  name: string;
  fieldName: string;
  connectedRecordId: string | number;
  selectedValue: {
    id: string | number;
    label: string;
  };
};

export function ComboboxPopover({
  input,
  ...comboboxProps
}: ComboboxPopoverProps & {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center space-x-4">
      <Popover
        open={comboboxProps.open}
        onOpenChange={comboboxProps.onOpenChange}
      >
        <PopoverTrigger asChild>
          <button className="text-sm">{comboboxProps.children}</button>
        </PopoverTrigger>

        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <div
              className="flex items-center justify-between border-b px-3"
              cmdk-input-wrapper=""
            >
              <Input
                value={input.query}
                placeholder="Change status..."
                onChange={(event) => input.onChange(event.target.value)}
                className={cn(
                  'flex h-10 w-full rounded-md shadow-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0'
                )}
              />

              <div className="text-foreground text-xs px-1 py-[1px] rounded-sm border-[1px]">
                {comboboxProps.tableName.slice(0, 1).toUpperCase()}
              </div>
            </div>

            <CommandList>
              <CommandGroup>
                {comboboxProps.values.map((value) => {
                  return (
                    <CommandItem
                      className="flex items-center justify-between whitespace-nowrap gap-3"
                      key={value.id}
                      value={value.id.toString()}
                      onSelect={() => {
                        comboboxProps.onChange(value);
                      }}
                    >
                      {comboboxProps.render(value)}
                      {comboboxProps.selected?.id === value.id ? (
                        <CheckIcon className="w-5 h-5 font-bold" />
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
