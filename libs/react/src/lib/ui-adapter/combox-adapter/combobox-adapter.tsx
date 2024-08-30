import { RELATIONAL_QUERY_KEY_PREFIX, useStoreValue } from '@apps-next/core';
import {
  ComboboAdapterProps,
  ComboboxAdapterOptions,
  ComboboxPopoverProps,
} from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { ComboboxFieldValue } from '../../ui-components/render-combobox-field-value';
import { useRelationalQuery } from '../../use-query-relational';
import {
  updateRelationalQueryDataAtom,
  useRelationalQueryData,
} from '../../use-relational-query-data';
import { useView } from '../../use-view';
import {
  comboboxStateAtom,
  debouncedQueryAtom,
  initComboboxAtom,
  State,
} from './combobox.store';
import { useQueryClient } from '@tanstack/react-query';

export type UseComboboAdaper = typeof useCombobox;

export const useCombobox = (
  options?: ComboboxAdapterOptions
): (() => ComboboxPopoverProps) => {
  const { list } = useStoreValue();
  const { viewConfigManager } = useView();

  const relationalFields = viewConfigManager.getRelationalFieldList();
  const fieldDefault = relationalFields?.[0];

  const { prefetchRelatioanlQuery: prefetchQuery } = useRelationalQuery({
    tableName: fieldDefault.name,
  });
  const prefetchedRef = React.useRef(false);

  const queryClient = useQueryClient();

  const props = React.useMemo(() => {
    return {
      name:
        list?.focusedRelationField?.field?.relation?.fieldName ??
        fieldDefault.relation?.fieldName ??
        '',
      fieldName:
        list?.focusedRelationField?.field?.relation?.tableName ??
        fieldDefault.name ??
        '',
      connectedRecordId: list?.focusedRelationField?.row.id ?? '',
      selectedValue: {
        id: list?.focusedRelationField?.value.id ?? '',
        label: list?.focusedRelationField?.value.label ?? '',
      },
    } satisfies ComboboAdapterProps;
  }, [list, fieldDefault]);

  const field = props.fieldName
    ? viewConfigManager.getFieldBy(props.fieldName)
    : fieldDefault;

  const initializeCombobox = useSetAtom(initComboboxAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);

  const { debouncedQuery, ...comboboxStateDict } =
    useAtomValue(comboboxStateAtom);

  const identifier = props.fieldName;

  const state = comboboxStateDict.state?.[identifier as string] as
    | State
    | undefined;

  const updateQueryData = useSetAtom(updateRelationalQueryDataAtom);

  React.useEffect(() => {
    if (prefetchedRef.current) return;

    prefetchedRef.current = true;

    relationalFields.forEach((field, index) => {
      if (index === 0) return;

      prefetchQuery?.({ tableName: field.name });

      const interval = setInterval(() => {
        const data = queryClient.getQueryData([
          RELATIONAL_QUERY_KEY_PREFIX,
          field.name,
          '',
        ]);

        if (data) {
          clearInterval(interval);

          updateQueryData({
            dataRaw: (data as any).data || [],
            tableName: field.name,
            identifier: field.name,
          });
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
      }, 1000);
    });
  }, [prefetchQuery, updateQueryData, relationalFields, queryClient]);

  useRelationalQueryData({
    identifier,
    tableName: field?.relation?.tableName ?? '',
    recordId: props.connectedRecordId.toString(),
    query: identifier === debouncedQuery.fieldName ? debouncedQuery.query : '',
  });

  const getComboboxProps = () => {
    return {
      rect: list?.focusedRelationField?.rect ?? null,
      tableName: field?.relation?.tableName ?? '',
      open: list?.focusedRelationField ? true : false,
      selected: state?.selected ?? null,
      values: state?.values ?? [],
      onOpenChange: () => {
        options?.onClose?.();
        setDebouncedValue({
          query: '',
          fieldName: identifier as string,
        });
      },
      onChange: (value) => {
        options?.onSelect?.({
          value,
          rowId: props.connectedRecordId,
          fieldName: props.fieldName,
        });
      },
      render: (value) => (
        <ComboboxFieldValue
          fieldName={props.fieldName}
          value={value}
          identifier={identifier}
          connectedRecordId={props.connectedRecordId.toString()}
        />
      ),
      input: {
        placeholder: '',
        query: comboboxStateDict.query.query ?? '',
        onChange(query) {
          setDebouncedValue({
            query,
            fieldName: identifier as string,
          });
        },
      },
      multiple: Boolean(field?.relation?.manyToManyRelation),
    } satisfies ComboboxPopoverProps;
  };

  React.useEffect(() => {
    if (props.selectedValue.id && identifier) {
      initializeCombobox({
        fieldName: identifier,
        initialSelected: props.selectedValue,
      });
    }
  }, [identifier, initializeCombobox, props]);

  return getComboboxProps;
};
