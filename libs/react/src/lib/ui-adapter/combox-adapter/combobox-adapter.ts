import { ComboboxProps, FormField } from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useRelationalQuery } from '../../use-query-relational';
import {
  comboboxStateAtom,
  debouncedQueryAtom,
  initComboboxAtom,
  updateValuesAtom,
} from './combobox.store';

export const useCombobox = (props: FormField<any>): (() => ComboboxProps) => {
  const _state = useAtomValue(comboboxStateAtom);
  const updateValues = useSetAtom(updateValuesAtom);
  const initializeCombobox = useSetAtom(initComboboxAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);

  const state = _state.state[props.name as string];

  const { data } = useRelationalQuery({
    tableName: props.relation?.tableName ?? '',
    query:
      _state.query.fieldName === props.name
        ? _state.debouncedQuery.query || ''
        : '',
  });

  const getComboboxProps = () => {
    return {
      listProps: {
        values: data || [],
        onSelectedChange: (value) => {
          updateValues({
            fieldName: props.name as string,
            state: {
              selected: value,
            },
          });
        },
      },
      comboboxProps: {
        label: 'Assigned to',
        onChange: (value) => {
          updateValues({
            fieldName: props.name as string,
            state: {
              selected: value,
            },
          });
        },
        selected: state?.selected,
      },
      inputProps: {
        placeholder: props.placeholder,
        query: _state.query.query ?? '',
        onChange(query) {
          setDebouncedValue({
            query,
            fieldName: props.name as string,
          });
        },
        onBlur: () => {
          setDebouncedValue({
            query: '',
            fieldName: props.name as string,
          });
        },
      },
    } satisfies ComboboxProps;
  };

  const propsRef = React.useRef(props);

  React.useEffect(() => {
    if (!data) return;

    updateValues({
      fieldName: propsRef.current.name as string,
      state: { values: data || [] },
    });
  }, [data, updateValues]);

  React.useEffect(() => {
    if (propsRef.current.value) {
      initializeCombobox({
        fieldName: props.name as string,
        initialSelected: propsRef.current.value,
      });
    }
  }, [initializeCombobox, props.name]);

  return getComboboxProps;
};
