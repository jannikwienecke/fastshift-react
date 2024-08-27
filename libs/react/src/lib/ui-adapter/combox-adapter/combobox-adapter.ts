import { ComboboxProps } from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useRelationalQuery } from '../../use-query-relational';
import { useView } from '../../use-view';
import {
  comboboxStateAtom,
  debouncedQueryAtom,
  initComboboxAtom,
  updateValuesAtom,
} from './combobox.store';

export const useCombobox = (props: {
  fieldName: string;
  placeholder: string;
  // TODO check type here
  value: any;
}): (() => ComboboxProps) => {
  const _state = useAtomValue(comboboxStateAtom);
  const updateValues = useSetAtom(updateValuesAtom);
  const initializeCombobox = useSetAtom(initComboboxAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);

  const { viewConfigManager } = useView();
  const field = viewConfigManager.getFieldBy(props.fieldName);

  const state = _state.state[field.name as string];

  const { data } = useRelationalQuery({
    tableName: field.relation?.tableName ?? '',
    query:
      _state.query.fieldName === field.name
        ? _state.debouncedQuery.query || ''
        : '',
  });

  const getComboboxProps = () => {
    return {
      listProps: {
        values: data || [],
        onSelectedChange: (value) => {
          updateValues({
            fieldName: field.name as string,
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
            fieldName: field.name as string,
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
            fieldName: field.name as string,
          });
        },
        onBlur: () => {
          setDebouncedValue({
            query: '',
            fieldName: field.name as string,
          });
        },
      },
    } satisfies ComboboxProps;
  };

  const propsRef = React.useRef(props);

  React.useEffect(() => {
    if (!data) return;

    updateValues({
      fieldName: propsRef.current.fieldName as string,
      state: { values: data || [] },
    });
  }, [data, updateValues]);

  React.useEffect(() => {
    if (propsRef.current.value) {
      initializeCombobox({
        fieldName: field.name as string,
        initialSelected: propsRef.current.value,
      });
    }
  }, [initializeCombobox, field.name]);

  return getComboboxProps;
};
