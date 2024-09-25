import {
  ComboboxPopoverProps,
  FieldConfig,
  getRelationTableName,
  makeData,
  Row,
} from '@apps-next/core';
import { useDebounce, usePrevious } from '@uidotdev/usehooks';
import React, { useRef } from 'react';
import { useQuery } from '../../use-query';
import { useQueryDataOf } from '../../use-query-data-relational';
import { useView } from '../../use-view';
import { ComboboxFieldValue } from '../../ui-components/render-combobox-field-value';
import { ComboboxInitPayload, useComboboxStore } from './_combobox.store/store';

export type UseComboboAdaper = typeof useCombobox;

export type UseComboboxProps = {
  state: Omit<ComboboxInitPayload, 'defaultData' | 'registeredViews'> | null;
  onClose: () => void;
  onSelect: (value: Row) => void;
  renderValue?: (props: { value: Row; field: FieldConfig }) => React.ReactNode;
};

export const useCombobox = ({
  state: initialState,
  onClose,
  onSelect,
  ...props
}: UseComboboxProps) => {
  const prevFieldName = usePrevious(initialState?.field?.name);

  const [store, dispatch] = useComboboxStore();
  const { registeredViews } = useView();
  const query = useDebounce(store.query, 300);

  const defaultData = useQueryDataOf(getRelationTableName(initialState?.field));

  const renderValue = (props: { value: Row; field: FieldConfig }) => (
    <ComboboxFieldValue {...props} />
  );

  const { data, isFetching, isFetched } = useQuery({
    query: query,
    relationQuery: {
      tableName: store.tableName ?? '',
    },
    disabled: !store.field || !query || !!store.field.enum,
  });

  React.useEffect(() => {
    if (isFetched && !isFetching && initialState?.field?.relation?.tableName) {
      dispatch({
        type: 'HANDLE_QUERY_DATA',
        data: makeData(
          registeredViews,
          getRelationTableName(initialState?.field)
        )(data ?? []).rows,
      });
    }
  }, [
    data,
    dispatch,
    initialState?.field,
    isFetched,
    isFetching,
    registeredViews,
  ]);

  const lastInitialState = useRef(initialState);

  React.useEffect(() => {
    if (lastInitialState.current?.field?.name === initialState?.field?.name)
      return;

    lastInitialState.current = initialState;
    if (!initialState?.field) {
      dispatch({ type: 'CLOSE' });
    } else {
      dispatch({
        type: 'INITIALIZE',
        payload: {
          ...initialState,
          defaultData,
          registeredViews,
        },
      });
    }
  }, [dispatch, initialState, defaultData, registeredViews, prevFieldName]);

  const getComboboxProps = () => {
    return {
      ...store,
      onOpenChange: (open) => {
        if (!open && initialState?.field) {
          onClose?.();
        }
      },
      onChange: (value) => {
        dispatch({ type: 'SELECT_VALUE', payload: value });
        onSelect?.(value);
      },

      render: (value) => {
        if (!store.field) return null;
        const fn = props.renderValue ?? renderValue;
        return fn({
          field: store.field,
          value,
        });
      },

      input: {
        placeholder: '',
        query: store.query,
        onChange(query) {
          dispatch({ type: 'UPDATE_QUERY', payload: query });
        },
      },

      multiple: store.multiple,
      name: initialState?.field?.name ?? '',
    } satisfies ComboboxPopoverProps<Row>;
  };

  return getComboboxProps;
};
