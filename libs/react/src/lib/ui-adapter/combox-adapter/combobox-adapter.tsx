import {
  ComboboxGetPropsOptions,
  ComboboxPopoverProps,
  ComboxboxItem,
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
  toggleOpenAtom,
} from './combobox.store';

export type UseComboboAdaper = typeof useCombobox;

export const useCombobox = (props: {
  name: string;
  placeholder?: string;
  fieldName: string;
  connectedRecordId: string | number;
  selectedValue: ComboxboxItem;
}): (() => ComboboxPopoverProps) => {
  const initializeCombobox = useSetAtom(initComboboxAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);
  const toggleOpen = useSetAtom(toggleOpenAtom);

  const { debouncedQuery, ...comboboxStateDict } =
    useAtomValue(comboboxStateAtom);

  const { viewConfigManager } = useView();
  const field = viewConfigManager.getFieldBy(props.fieldName);

  const identifier = props.connectedRecordId + props.fieldName;

  const state = comboboxStateDict.state?.[identifier as string] as
    | State
    | undefined;

  useRelationalQueryData({
    identifier,
    tableName: field.relation?.tableName ?? '',
    query: identifier === debouncedQuery.fieldName ? debouncedQuery.query : '',
  });

  const getComboboxProps = (options?: ComboboxGetPropsOptions) => {
    return {
      tableName: field.relation?.tableName ?? '',
      open: state?.open ?? false,
      selected: state?.selected ?? null,
      values: state?.values ?? [],
      onOpenChange: () => toggleOpen({ fieldName: identifier }),
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
        placeholder: props.placeholder ?? '',
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
      multiple: Boolean(field.relation?.manyToManyRelation),
    } satisfies ComboboxPopoverProps;
  };

  const propsRef = React.useRef(props);

  React.useEffect(() => {
    if (propsRef.current.selectedValue) {
      initializeCombobox({
        fieldName: identifier,
        initialSelected: propsRef.current.selectedValue,
      });
    }
  }, [field, identifier, initializeCombobox, props.name]);

  return getComboboxProps;
};
