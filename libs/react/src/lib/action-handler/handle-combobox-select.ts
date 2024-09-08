import { RecordType, Row } from '@apps-next/core';
import React from 'react';
import { handleSelectUpdate } from '../field-features/update-record-mutation';
import { useStoreValue, useStoreDispatch } from '../store.ts';
import { useMutation } from '../use-mutation';

export const useHandleSelectCombobox = () => {
  const { runMutate } = useMutation();

  const { list } = useStoreValue();

  const dispatch = useStoreDispatch();

  const startSelectedRef = React.useRef<string | string[]>();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSelect = (value: Row) => {
    const { row, field } = list?.focusedRelationField || {};

    if (!row) throw new Error('no row');
    if (!field) throw new Error('no field');

    const isManyToManyRelation = field?.relation?.manyToManyRelation;

    if (field.type === 'Boolean') {
      const mutation = handleSelectUpdate({
        field,
        row,
        value,
        selected: list?.focusedRelationField?.selected ?? [],
      });

      runMutate({
        mutation: mutation,
      });
    } else {
      const selected = list?.focusedRelationField?.selected;
      const selectedId =
        typeof selected === 'string'
          ? selected
          : Array.isArray(selected)
          ? selected.map((v) => v.id)
          : selected?.id;

      if (!startSelectedRef.current && selected) {
        startSelectedRef.current = Array.isArray(selected)
          ? selected.map((v) => v.id)
          : selectedId;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(
        () => {
          timeoutRef.current = null;

          if (!field) return;

          const newSelected = Array.isArray(selected)
            ? updateManyToManyRelation(selected ?? [], value).map((v) => v.id)
            : selectedId;

          startSelectedRef.current = newSelected;

          const valueToUpdate =
            !field.relation && !field.enum ? value.raw : value.id;
          runMutate({
            mutation: {
              type: 'UPDATE_RECORD',
              handler: (items) => {
                if (isManyToManyRelation) return items;

                return items.map((item) => {
                  if (item.id === row.id) {
                    const newValue = {
                      ...item,
                      [field.name]: isManyToManyRelation
                        ? updateManyToManyRelation(item[field.name], value)
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
                  [field.relation?.fieldName ?? field.name]:
                    isManyToManyRelation ? newSelected : valueToUpdate,
                },
              },
            },
          });
        },
        isManyToManyRelation ? 500 : 0
      );
    }

    // behavour for the combobox
    if (!isManyToManyRelation) {
      setTimeout(() => {
        dispatch({ type: 'DESELECT_RELATIONAL_FIELD' });
      }, 100);
    }

    dispatch({ type: 'UPDATE_SELECTED_RELATIONAL_FIELD', selected: value });
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
