import {
  FilterItemType,
  FilterProps,
  FilterType,
  MakeFilterPropsOptions,
  makeRowFromValue,
  RecordType,
  renderModelName,
  t,
} from '@apps-next/core';
import {
  filterItems$,
  makeFilterPropsOptions,
  store$,
} from '../../legend-store';
import { RenderComponent } from '../../ui-components/render-component';

export const getFilterValue = (f: FilterType): string => {
  if (f.type === 'relation') {
    return f.values.length === 1
      ? f.values[0]?.label ?? ''
      : `${f.values.length} ${renderModelName(f.field.name, t, true)}`;
  }

  return f.value?.label ?? '';
};

const getFilter = (name: string) => {
  const _f = store$.filter.filters.get().find((f) => f.field.name === name);
  if (!_f) throw new Error('Filter not found');
  return _f;
};

export const makeFilterProps = <T extends RecordType>(
  options?: MakeFilterPropsOptions<T>
): FilterProps => {
  makeFilterPropsOptions.set(options);

  return {
    onOpen: store$.filterOpen,
    filters: filterItems$.get(),
    label: options?.label ?? 'filter.button.label',
    onRemove: ({ name }) => store$.filterRemoveFilter(getFilter(name)),
    onSelect: (value, rect) => {
      const filter = getFilter(value.name);
      store$.filterOpenExisting(filter, rect);
    },
    onOperatorClicked: (filter, rect) => {
      store$.filterOpenOperator(getFilter(filter.name), rect);
    },
    renderFilterValue: (filterValue: FilterItemType) => {
      const field = getFilter(filterValue.name).field;

      return (
        <RenderComponent
          componentType="default"
          field={field}
          value={makeRowFromValue(filterValue.value, field)}
        />
      );
    },
  } satisfies FilterProps;
};
