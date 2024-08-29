import { useStoreValue } from '@apps-next/core';
import {
  ComboboAdapterProps,
  ComboboxAdapterOptions,
  ComboboxPopoverProps,
} from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { ComboboxFieldValue } from '../../ui-components/render-combobox-field-value';
import { useRelationalQueryData } from '../../use-relational-query-data';
import { useView } from '../../use-view';
import {
  comboboxStateAtom,
  debouncedQueryAtom,
  initComboboxAtom,
  State,
} from './combobox.store';

export type UseComboboAdaper = typeof useCombobox;

export const useCombobox = (
  options?: ComboboxAdapterOptions
): (() => ComboboxPopoverProps) => {
  const { list } = useStoreValue();

  const props = React.useMemo(() => {
    return {
      name:
        list?.focusedRelationField?.field?.relation?.fieldName ?? 'projectId',
      fieldName:
        list?.focusedRelationField?.field?.relation?.tableName ?? 'project',
      connectedRecordId:
        list?.focusedRelationField?.row.id ?? 'cm04vi2ff001uenx68cp65f3t',
      selectedValue: {
        id: list?.focusedRelationField?.value.id ?? 'cm04vi2f4000wenx63rae4exv',
        label:
          list?.focusedRelationField?.value.label ?? 'Fantastic Plastic Soap',
      },
    } satisfies ComboboAdapterProps;
  }, [list]);

  const initializeCombobox = useSetAtom(initComboboxAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);

  const { debouncedQuery, ...comboboxStateDict } =
    useAtomValue(comboboxStateAtom);

  const { viewConfigManager } = useView();
  const field = props.fieldName
    ? viewConfigManager.getFieldBy(props.fieldName)
    : null;

  const identifier = props.connectedRecordId + props.fieldName;

  const state = comboboxStateDict.state?.[identifier as string] as
    | State
    | undefined;

  useRelationalQueryData({
    identifier,
    tableName: field?.relation?.tableName ?? '',
    query: identifier === debouncedQuery.fieldName ? debouncedQuery.query : '',
  });

  const getComboboxProps = () => {
    return {
      rect: list?.focusedRelationField?.rect ?? null,
      tableName: field?.relation?.tableName ?? '',
      open: list?.focusedRelationField ? true : false,
      selected: state?.selected ?? null,
      values: state?.values ?? [],
      onOpenChange: () => options?.onClose?.(),
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
        onBlur: () => {
          setDebouncedValue({
            query: '',
            fieldName: identifier as string,
          });
        },
      },
      multiple: Boolean(field?.relation?.manyToManyRelation),
    } satisfies ComboboxPopoverProps;
  };

  React.useEffect(() => {
    if (props.selectedValue && identifier) {
      initializeCombobox({
        fieldName: identifier,
        initialSelected: props.selectedValue,
      });
    }
  }, [identifier, initializeCombobox, props]);

  return getComboboxProps;
};
