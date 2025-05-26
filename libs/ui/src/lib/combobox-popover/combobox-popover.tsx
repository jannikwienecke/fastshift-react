'use client';

import {
  ComboboxPopoverProps,
  ComboxboxItem,
  getTableLabel,
} from '@apps-next/core';
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
import { DatePicker } from '../date-picker';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from 'lucide-react';

export function ComboboxPopover<T extends ComboxboxItem = ComboxboxItem>(
  props: ComboboxPopoverProps<T> & { children?: React.ReactNode }
) {
  const { input, rect, ...comboboxProps } = props || {};
  const { t } = useTranslation();

  if (!props) return null;

  if (props.datePickerProps?.open) {
    return <DatePicker {...props.datePickerProps} />;
  }
  return (
    <Popover
      modal={true}
      open={
        comboboxProps.open &&
        Boolean(comboboxProps.name) &&
        comboboxProps.name !== 'commandbar'
      }
      onOpenChange={(open) => {
        comboboxProps.onOpenChange?.(open);
      }}
    >
      {props.children && !rect?.width ? (
        <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      ) : null}

      {rect ? (
        <>
          <PopoverTrigger asChild>
            <div
              style={{
                position: 'fixed',
                top: `${rect.top + rect.height}px`,
                left: `${rect.left}px`,
              }}
            />
          </PopoverTrigger>
        </>
      ) : null}

      {comboboxProps.open && input && (
        <PopoverContent
          className="p-0 mx-0 mr-2 z-50"
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
                    input.placeholder ||
                    `${t('common.change')} ${getTableLabel(
                      comboboxProps.tableName || comboboxProps.name,
                      comboboxProps.multiple ? undefined : true
                    )}...`
                  }
                  onChange={(event) => input.onChange(event.target.value)}
                  className={cn(
                    'flex h-10 w-full rounded-md shadow-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0'
                  )}
                />
              ) : null}
              {comboboxProps.tableName ? (
                <div className="text-foreground text-xs px-1 py-[1px] rounded-sm border-[1px]">
                  {comboboxProps.tableName.slice(0, 1).toUpperCase()}
                </div>
              ) : null}
            </div>

            <CommandList>
              <>
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
                            {comboboxProps.showCheckboxInList ? (
                              <Checkbox checked={isSelected ? true : false} />
                            ) : null}

                            <div>{comboboxProps.render(value)}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CheckIcon
                              aria-label={
                                isSelected
                                  ? 'combobox-checked'
                                  : 'combobox-not-checked'
                              }
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

                {comboboxProps.values.length === 0 ? (
                  <CommandGroup>
                    <CommandItem
                      // onEnter
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          props.onClickCreateNew(input.query);
                        }
                      }}
                      onSelect={() => {
                        props.onClickCreateNew(input.query);
                      }}
                      className={
                        comboboxProps.values.length === 0 ? 'bg-slate-100' : ''
                      }
                    >
                      <div>
                        <PlusIcon />
                      </div>
                      <div className="text-sm">
                        {/* TODO: fix should be create new {field} or something an dtranslated */}
                        {/* {should not be visible for enum etc.} */}
                        {'Create new label:'}{' '}
                        <span className="text-muted-foreground">
                          {input.query}
                        </span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                ) : null}
              </>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
