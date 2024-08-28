'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
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
  inputProps: {
    query: string;
    placeholder: string;
    onChange: (query: string) => void;
    onBlur?: () => void;
  };
  listProps: {
    values: ComboxboxItem[];
  };

  comboboxProps: {
    onChange: (value: ComboxboxItem) => void;
    selected: ComboxboxItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tableName: string;
    render: (value: ComboxboxItem) => React.ReactNode;
  };
};

export function ComboboxPopover(
  props: ComboboxPopoverProps & {
    children: React.ReactNode;
  }
) {
  return (
    <div className="flex items-center space-x-4">
      <Popover
        open={props.comboboxProps.open}
        onOpenChange={props.comboboxProps.onOpenChange}
      >
        <PopoverTrigger asChild>
          <button className="text-sm">{props.children}</button>
        </PopoverTrigger>

        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <div
              className="flex items-center justify-between border-b px-3"
              cmdk-input-wrapper=""
            >
              <Input
                value={props.inputProps.query}
                placeholder="Change status..."
                onChange={(event) =>
                  props.inputProps.onChange(event.target.value)
                }
                className={cn(
                  'flex h-10 w-full rounded-md shadow-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0'
                )}
              />

              <div className="text-foreground text-xs px-1 py-[1px] rounded-sm border-[1px]">
                {props.comboboxProps.tableName.slice(0, 1).toUpperCase()}
              </div>
            </div>

            <CommandList>
              <CommandGroup>
                {props.listProps.values.map((value) => (
                  <CommandItem
                    key={value.id}
                    value={value.id.toString()}
                    onSelect={() => {
                      props.comboboxProps.onChange(value);
                    }}
                  >
                    {props.comboboxProps.render(value)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
