import {
  RecordType,
  Row,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import { ComboboxAdapterOptions } from '@apps-next/ui';
import { useMutation } from '../use-mutation';
import React from 'react';
export const useHandleSelectCombobox = () => {
  const { mutate } = useMutation();

  const { list } = useStoreValue();

  const dispatch = useStoreDispatch();

  const startSelectedRef = React.useRef<string | string[]>();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSelect = ({
    value,
  }: Parameters<ComboboxAdapterOptions<Row>['onSelect']>[0]) => {
    const { row, field } = list?.focusedRelationField || {};

    if (!field?.relation) throw new Error('no relation field');
    if (!row) throw new Error('no row');

    const isManyToManyRelation = field.relation.manyToManyRelation;

    if (!isManyToManyRelation) {
      setTimeout(() => {
        dispatch({ type: 'DESELECT_RELATIONAL_FIELD' });
      }, 100);
    }

    if (!startSelectedRef.current && list?.focusedRelationField?.selected) {
      startSelectedRef.current = Array.isArray(
        list.focusedRelationField.selected
      )
        ? list.focusedRelationField.selected.map((v) => v.id)
        : list.focusedRelationField.selected.id;
    }

    dispatch({ type: 'UPDATE_SELECTED_RELATIONAL_FIELD', selected: value });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(
      () => {
        timeoutRef.current = null;

        if (!field.relation) return;
        const newSelected = Array.isArray(list?.focusedRelationField?.selected)
          ? updateManyToManyRelation(
              list.focusedRelationField.selected ?? [],
              value
            ).map((v) => v.id)
          : list?.focusedRelationField?.selected.id;

        startSelectedRef.current = newSelected;

        mutate({
          mutation: {
            type: 'UPDATE_RECORD',
            handler: (items) => {
              if (isManyToManyRelation) return items;

              return items.map((item) => {
                if (item.id === row.id) {
                  const newValue = {
                    ...item,
                    [field.name]: isManyToManyRelation
                      ? updateManyToManyRelation(item[field.name], value.raw)
                      : value.raw,
                  };
                  return newValue;
                }
                return item;
              });
            },
            payload: {
              id: row.id,
              record: {
                [field.relation.fieldName]: isManyToManyRelation
                  ? newSelected
                  : value.id,
              },
            },
          },
        });
      },
      isManyToManyRelation ? 500 : 0
    );
  };

  const handleClose = () => {
    setTimeout(() => {
      dispatch({ type: 'DESELECT_RELATIONAL_FIELD' });
    }, 100);
  };

  return { handleSelect, handleClose };
};

function updateManyToManyRelation(
  currentValues: RecordType[],
  newValue: RecordType
) {
  const existingIndex = currentValues.findIndex(
    (value) => value.id === newValue.id
  );
  return existingIndex !== -1
    ? currentValues.filter((_, index) => index !== existingIndex)
    : [...currentValues, newValue];
}
