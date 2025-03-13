'use client';

import {
  FilterItemType,
  FilterProps,
  translateField,
  TranslationKeys,
  useTranslation,
} from '@apps-next/core';
import { Cross2Icon } from '@radix-ui/react-icons';
import { ListFilter } from 'lucide-react';
import React from 'react';

export const FilterDefault = (props: FilterProps) => {
  const { filters, onOpen, label } = props;
  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        {filters.length > 0 && <FilterList {...props} />}

        <FilterButton
          label={label}
          onOpen={onOpen}
          hasFilter={filters.length > 0}
        />
      </div>
    </>
  );
};

const FilterList = (props: FilterProps) => {
  return (
    <div
      data-testid="filter-list"
      className="flex flex-row gap-2 items-center flex-wrap text-xs"
    >
      {props.filters.map((f) => {
        const ref = React.createRef<HTMLDivElement>();
        return (
          <span key={`filter-${f.name}-${f.operator}`} ref={ref}>
            <FilterItem
              renderFilterItem={props.renderFilterValue}
              filter={f}
              onRemove={() => {
                props.onRemove(f);
              }}
              onOperatorClicked={() => {
                const rect = ref.current?.getBoundingClientRect();
                if (!rect) return;
                props.onOperatorClicked(f, rect);
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
  onOperatorClicked: () => void;
  renderFilterItem: (filter: FilterItemType) => React.ReactNode;
}) => {
  const { filter, onRemove } = props;
  const { t } = useTranslation();
  const translatedOperator = t(`filter.operator.${filter.operator}` as any);

  return (
    <div
      data-testid={`filter-item-${filter.name}`}
      className="border border-input rounded-sm text-muted-foreground relative"
    >
      <div className="flex flex-row items-center flex-wrap">
        <div className="flex items-center gap-[1px] border-r-[1px] pl-2 border-r-input/30 pr-2 py-1">
          {filter.icon ? (
            <div>
              <filter.icon className="w-4 h-4 text-foreground" />
            </div>
          ) : null}

          <div>{translateField(t, filter)}</div>
        </div>

        <button
          onClick={props.onOperatorClicked}
          className="border-r-[1px] py-1 border-r-input/30 px-3 hover:bg-accent"
        >
          {translatedOperator.includes('filter.operator.')
            ? filter.operator
            : translatedOperator}
        </button>

        <button className="flex items-center px-1 gap-[1px] border-r-[1px] border-r-input/30 pr-2 py-1 hover:bg-accent">
          {filter.icon ? (
            <div>
              <filter.icon className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : null}

          <div onClick={props.onSelect}>
            {filter.moreThanOneSelected
              ? filter.value
              : props.renderFilterItem(filter)}
          </div>
        </button>

        <button
          data-testid={`remove-filter-${filter.name}`}
          className="px-2 hover:bg-accent py-1"
          onClick={onRemove}
        >
          <Cross2Icon className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
};

const FilterButton = (props: {
  onOpen: (rect: DOMRect) => void;
  hasFilter: boolean;
  label?: string;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <button
        data-testid="filter-button"
        onClick={(e) => props.onOpen(e.currentTarget.getBoundingClientRect())}
        className="flex flex-row text-xs items-center p-1 px-2 rounded-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <ListFilter className="w-4 h-4" />

        {props.hasFilter ? (
          <></>
        ) : (
          <span className="pl-2">
            {props.label
              ? t(props.label as TranslationKeys)
              : t('filter.button.label')}
          </span>
        )}
      </button>
    </>
  );
};

export const Filter = {
  Default: FilterDefault,
  Button: FilterButton,
  Item: FilterItem,
  List: FilterList,
};
