'use client';

import { ComboboxPopoverProps, ComboxboxItem } from '@apps-next/core';
import { CheckIcon } from '@radix-ui/react-icons';
import React from 'react';
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

export function ComboboxPopover<T extends ComboxboxItem = ComboxboxItem>(
  props: ComboboxPopoverProps<T> & { children?: React.ReactNode }
) {
  const { input, rect, ...comboboxProps } = props || {};

  if (!props) return null;
  return (
    <Popover
      modal={true}
      open={comboboxProps.open && Boolean(comboboxProps.name)}
      onOpenChange={(open) => {
        comboboxProps.onOpenChange?.(open);
      }}
    >
      <PopoverTrigger asChild>
        {props.children && !rect?.width ? (
          props.children
        ) : rect?.width ? (
          <>
            {/* FILTR TRIGGER MUST BE A BUTTON */}
            <button
              style={{
                position: 'fixed',
                top: `${rect.top + rect.height}px`,
                left: `${rect.left - rect.width / 2}px`,
                width: `${0}px`,
                height: `${0}px`,
              }}
            />
          </>
        ) : null}
      </PopoverTrigger>

      {comboboxProps.open && input && (
        <PopoverContent
          className="p-0"
          side="bottom"
          align="start"
          sideOffset={5}
          data-testid="combobox-popover"
        >
          <Command>
            <div
              className="flex items-center justify-between border-b pr-2"
              cmdk-input-wrapper=""
            >
              {comboboxProps.searchable ? (
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
              ) : null}

              <div className="text-foreground text-xs px-1 py-[1px] rounded-sm border-[1px]">
                {comboboxProps.tableName.slice(0, 1).toUpperCase()}
              </div>
            </div>

            <CommandList>
              <CommandGroup>
                {comboboxProps.values.map((value, index) => {
                  const isSelected = comboboxProps.selected?.find(
                    (s) => s.id === value.id
                  );

                  return (
                    <div key={value.id.toString()} className="">
                      <CommandItem
                        className="flex items-center justify-between whitespace-nowrap gap-3 text-[13px]"
                        value={value.id.toString()}
                        onSelect={() => {
                          comboboxProps.onChange(value);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {comboboxProps.multiple ? (
                            <Checkbox checked={isSelected ? true : false} />
                          ) : null}

                          <div>{comboboxProps.render(value)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CheckIcon
                            className={cn(
                              'w-5 h-5 font-bold invisible',
                              isSelected ? 'visible' : ''
                            )}
                          />

                          <span className="text-[11px]">{index}</span>
                        </div>
                      </CommandItem>
                    </div>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
