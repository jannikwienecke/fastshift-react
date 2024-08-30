'use client';

import { CheckIcon } from '@radix-ui/react-icons';
import { Input } from '../components';
import { Checkbox } from '../components/checkbox';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../components/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/popover';
import { cn } from '../utils';
import { ComboboxPopoverProps } from './combobox-popver.types';

export function ComboboxPopover({
  input,
  rect,
  ...comboboxProps
}: ComboboxPopoverProps) {
  if (!rect) return null;

  return (
    <Popover
      open={comboboxProps.open}
      onOpenChange={comboboxProps.onOpenChange}
    >
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

      <PopoverContent
        className="p-0"
        side="bottom"
        align="start"
        sideOffset={5}
      >
        <Command>
          <div
            className="flex items-center justify-between border-b pr-2"
            cmdk-input-wrapper=""
          >
            <Input
              value={input.query}
              placeholder={
                input.placeholder || `Change ${comboboxProps.tableName}...`
              }
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
              {comboboxProps.values.map((value, index) => {
                const isSelected = comboboxProps.multiple
                  ? (comboboxProps.selected?.id as string[] | undefined)?.some(
                      (selected) => selected === value.id
                    )
                  : false;

                return (
                  <CommandItem
                    className="flex items-center justify-between whitespace-nowrap gap-3 text-[13px]"
                    key={value.id.toString()}
                    value={value.id.toString()}
                    onSelect={() => {
                      comboboxProps.onChange(value);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {comboboxProps.multiple ? (
                        <Checkbox checked={isSelected} />
                      ) : null}

                      <div>{comboboxProps.render(value)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {comboboxProps.selected?.id === value.id ? (
                        <CheckIcon className="w-5 h-5 font-bold" />
                      ) : null}

                      <span className="text-[11px]">{index}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
