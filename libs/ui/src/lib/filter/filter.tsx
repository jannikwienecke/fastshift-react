'use client';

import {
  ComboboxPopoverProps,
  ComboxboxItem,
  FilterItemType,
  FilterProps,
} from '@apps-next/core';
import { Cross2Icon } from '@radix-ui/react-icons';
import { ListFilter } from 'lucide-react';
import { ComboboxPopover } from '../combobox-popover';
import React from 'react';

export const FilterDefault = (props: FilterProps) => {
  const { filters, onOpen, comboboxProps } = props;
  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        {filters.length > 0 && <FilterList {...props} />}

        <div className="relative">
          <FilterButton
            comboboxProps={comboboxProps}
            onOpen={onOpen}
            hasFilter={filters.length > 0}
          />
        </div>
      </div>
    </>
  );
};

const FilterList = (props: FilterProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-row gap-2 items-center flex-wrap text-xs">
      {props.filters.map((f) => {
        return (
          <span ref={ref}>
            <FilterItem
              key={`filter-${f.name}-${f.operator}`}
              filter={f}
              onRemove={() => {
                props.onRemove(f);
              }}
              onSelect={() => {
                const rect = ref.current?.getBoundingClientRect();
                if (!rect) return;
                props.onSelect(f, rect);
              }}
            />
          </span>
        );
      })}
    </div>
  );
};

const FilterItem = (props: {
  filter: FilterItemType;
  onRemove: () => void;
  onSelect: () => void;
}) => {
  const { filter, onRemove } = props;
  return (
    <div className="border border-input rounded-sm text-muted-foreground ">
      <div className="flex flex-row items-center flex-wrap">
        <div className="flex items-center gap-[1px] border-r-[1px] pl-2 border-r-input/30 pr-2 py-1">
          {filter.icon ? (
            <div>
              <filter.icon className="w-4 h-4 text-foreground" />
            </div>
          ) : null}

          <div>{filter.label}</div>
        </div>

        <div className="border-r-[1px] py-1 border-r-input/30 px-3 hover:bg-accent">
          {filter.operator}
        </div>

        <div className="flex items-center px-1 gap-[1px] border-r-[1px] border-r-input/30 pr-2 py-1 hover:bg-accent">
          {filter.icon ? (
            <div>
              <filter.icon className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : null}

          <div onClick={props.onSelect}>{filter.value}</div>
        </div>

        <button className="px-2 hover:bg-accent py-1" onClick={onRemove}>
          <Cross2Icon className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
};

const FilterButton = (props: {
  comboboxProps: ComboboxPopoverProps<ComboxboxItem>;
  onOpen: () => void;
  hasFilter: boolean;
  label?: string;
}) => {
  console.log(props.comboboxProps.input?.placeholder);
  return (
    <ComboboxPopover {...props.comboboxProps}>
      <button
        data-testid="filter-button"
        onClick={props.onOpen}
        className="flex flex-row text-xs items-center p-1 px-2 rounded-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <ListFilter className="w-4 h-4" />

        {props.hasFilter ? (
          <span></span>
        ) : (
          <span className="pl-2">{props.label || 'Filter'}</span>
        )}
      </button>
    </ComboboxPopover>
  );
};

export const Filter = {
  Default: FilterDefault,
  Button: FilterButton,
  Item: FilterItem,
  List: FilterList,
};
