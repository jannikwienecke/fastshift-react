import {
  BaseViewConfigManager,
  clientConfigAtom,
  DataItem,
  DataRow,
  Model,
  viewsHelperAtom,
} from '@apps-next/core';
import { ComboboxPopoverProps } from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useQueryData } from '../../use-query-data';
import { useRelationalQuery } from '../../use-query-relational';
import { useView } from '../../use-view';
import {
  comboboxStateAtom,
  debouncedQueryAtom,
  initComboboxAtom,
  State,
  toggleOpenAtom,
  updateValuesAtom,
} from './combobox.store';

export const useCombobox = (props: {
  name: string;
  fieldName: string;
  uniqueId: string;
  placeholder: string;
  value: {
    id: string | number;
    label: string;
  };
  connectedRecordId: string | number;
}): (() => ComboboxPopoverProps) => {
  const _state = useAtomValue(comboboxStateAtom);
  const updateValues = useSetAtom(updateValuesAtom);
  const initializeCombobox = useSetAtom(initComboboxAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);
  const toggleOpen = useSetAtom(toggleOpenAtom);

  const { viewConfigManager } = useView();
  const field = viewConfigManager.getFieldBy(props.fieldName);

  const config = useAtomValue(clientConfigAtom);

  const fieldName = props.uniqueId ?? field.name;

  const state = _state.state?.[fieldName as string] as State | undefined;

  const { dataModel } = useQueryData();

  const { data } = useRelationalQuery({
    tableName: field.relation?.tableName ?? '',
    query:
      _state.query.fieldName === fieldName
        ? _state.debouncedQuery.query || ''
        : '',
  });

  const relationalViewHelper = useAtomValue(viewsHelperAtom);

  const getComboboxProps = () => {
    return {
      listProps: {
        values: state?.values || [],
      },
      comboboxProps: {
        render: (value) => {
          const ComboboxComponent =
            config?.fields[props.fieldName]?.component?.combobox;

          const row = state?.data
            ?.getRows()
            ?.find((item) => item.id === value.id);
          if (!row) return null;
          if (!state?.data) return null;

          const connectedRow = dataModel?.getRowById(props.connectedRecordId);
          if (!connectedRow) return null;

          const field = viewConfigManager.getFieldBy(props.fieldName);
          const item = DataItem.create({
            field: field,
            label: row.label,
            name: props.fieldName,
            value: field.relation?.manyToManyRelation
              ? [row.getRow()]
              : row.getRow(),
          });

          const _row = DataRow.create(
            connectedRow.props,
            viewConfigManager,
            relationalViewHelper.get(props.fieldName).all
          );

          _row.updateItem(props.fieldName, item);

          return (
            <>
              {ComboboxComponent ? (
                <ComboboxComponent data={_row} />
              ) : (
                <>{_row.getItemLabel(props.fieldName)}</>
              )}
            </>
          );
        },
        tableName: field.relation?.tableName ?? '',
        open: state?.open ?? false,
        onOpenChange: () => toggleOpen({ fieldName }),
        onChange: (value) => {
          updateValues({
            fieldName: fieldName as string,
            state: {
              selected: value,
            },
          });
        },
        selected: state?.selected ?? null,
      },
      inputProps: {
        placeholder: props.placeholder,
        query: _state.query.query ?? '',
        onChange(query) {
          setDebouncedValue({
            query,
            fieldName: fieldName as string,
          });
        },
        onBlur: () => {
          console.log('BLUR QUERY TO ', '');
          setDebouncedValue({
            query: '',
            fieldName: fieldName as string,
          });
        },
      },
    } satisfies ComboboxPopoverProps;
  };

  const propsRef = React.useRef(props);

  React.useEffect(() => {
    if (!data) return;

    const { relationalView, all } = relationalViewHelper.get(props.fieldName);

    const viewManager = new BaseViewConfigManager(relationalView);
    const model = Model.create(data, viewManager, all);

    updateValues({
      fieldName: fieldName as string,
      state: {
        dataRaw: data,
        data: model,
        values: data.map((item) => ({
          id: item.id,
          label: item.label,
        })),
      },
    });
  }, [
    data,
    fieldName,
    props.fieldName,
    relationalViewHelper,
    updateValues,
    viewConfigManager,
  ]);

  React.useEffect(() => {
    if (propsRef.current.value) {
      initializeCombobox({
        fieldName,
        initialSelected: propsRef.current.value,
      });
    }
  }, [field, fieldName, initializeCombobox, props.name]);

  return getComboboxProps;
};
