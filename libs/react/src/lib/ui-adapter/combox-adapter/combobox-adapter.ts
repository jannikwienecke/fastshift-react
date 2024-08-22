import { ComboboxProps } from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useRelationalQuery } from '../../use-query-relational';
import {
  comboboxStateAtom,
  debouncedQueryAtom,
  updateValuesAtom,
} from './combobox.store';

export const useCombobox = (props: {
  tableName: string;
}): (() => ComboboxProps) => {
  const state = useAtomValue(comboboxStateAtom);
  const updateValues = useSetAtom(updateValuesAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);

  const { data } = useRelationalQuery({
    tableName: props.tableName,
    query: state.debouncedQuery || '',
  });

  const getComboboxProps = () => {
    return {
      listProps: {
        values: data || [],
        onSelectedChange: (value) => {
          updateValues({
            selected: value,
          });
        },
      },
      comboboxProps: {
        label: 'Assigned to',
        onChange: (value) => {
          updateValues({
            selected: value,
          });
        },
        selected: state.selected,
      },
      inputProps: {
        query: state.query ?? '',
        onChange(query) {
          setDebouncedValue(query);
        },
        onBlur: () => {
          setDebouncedValue('');
        },
      },
    } satisfies ComboboxProps;
  };

  React.useEffect(() => {
    updateValues({
      values: data || [],
    });
  }, [data, updateValues]);

  return getComboboxProps;
};
