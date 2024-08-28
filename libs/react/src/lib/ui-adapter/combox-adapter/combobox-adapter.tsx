import {
  BaseViewConfigManager,
  clientConfigAtom,
  DataItem,
  DataRow,
  Model,
  viewsHelperAtom,
} from '@apps-next/core';
import { ComboboxPopoverProps, ComboxboxItem } from '@apps-next/ui';
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
import { useMutation } from '../../use-mutation';

export type UseComboboAdaper = typeof useCombobox;

export const useCombobox = (props: {
  name: string;
  placeholder?: string;
  fieldName: string;
  connectedRecordId: string | number;
  selectedValue: ComboxboxItem;
}): (() => ComboboxPopoverProps) => {
  const updateValues = useSetAtom(updateValuesAtom);
  const initializeCombobox = useSetAtom(initComboboxAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);
  const toggleOpen = useSetAtom(toggleOpenAtom);

  const { debouncedQuery, ...comboboxStateDict } =
    useAtomValue(comboboxStateAtom);

  const { viewConfigManager } = useView();
  const field = viewConfigManager.getFieldBy(props.fieldName);

  const config = useAtomValue(clientConfigAtom);

  const identifier =
    props.connectedRecordId + props.fieldName + props.selectedValue.id;

  const state = comboboxStateDict.state?.[identifier as string] as
    | State
    | undefined;

  const { dataModel } = useQueryData();

  const { data } = useRelationalQuery({
    tableName: field.relation?.tableName ?? '',
    query: identifier === debouncedQuery.fieldName ? debouncedQuery.query : '',
  });

  const { mutate } = useMutation();

  const relationalViewHelper = useAtomValue(viewsHelperAtom);

  const getComboboxProps = () => {
    return {
      tableName: field.relation?.tableName ?? '',
      open: state?.open ?? false,
      selected: state?.selected ?? null,
      values: state?.values ?? [],
      onOpenChange: () => toggleOpen({ fieldName: identifier }),
      onChange: (value) => {
        const field = viewConfigManager.getFieldBy(props.fieldName);
        if (!field.relation) return;

        const row = state?.data
          ?.getRows()
          ?.find((item) => item.id === value.id);
        if (!row) return;

        mutate({
          mutation: {
            type: 'UPDATE_RECORD',
            handler: (items) => {
              return items.map((item) => {
                if (item.id === props.connectedRecordId) {
                  return {
                    ...item,
                    [props.fieldName]: row.getRow(),
                  };
                }
                return item;
              });
            },
            payload: {
              id: props.connectedRecordId,
              record: {
                [field.relation.fieldName]: value.id,
              },
            },
          },
        });

        setTimeout(() => {
          // prevent seeing the flash of disappearing input text
          setDebouncedValue({
            query: '',
            fieldName: identifier as string,
          });
        }, 100);

        updateValues({
          fieldName: identifier as string,
          state: {
            selected: value,
            open: false,
          },
        });
      },
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
          id: row.id.toString(),
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
    } satisfies ComboboxPopoverProps;
  };

  const propsRef = React.useRef(props);

  React.useEffect(() => {
    if (!data) return;

    const { relationalView, all } = relationalViewHelper.get(props.fieldName);

    const viewManager = new BaseViewConfigManager(relationalView);
    const model = Model.create(data, viewManager, all);

    updateValues({
      fieldName: identifier as string,
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
    identifier,
    props.fieldName,
    relationalViewHelper,
    updateValues,
    viewConfigManager,
  ]);

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
