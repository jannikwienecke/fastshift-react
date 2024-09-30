import { RecordType, Row } from '@apps-next/core';
import React from 'react';
import { handleSelectUpdate } from '../field-features/update-record-mutation';
import { comboboxStore$, store$ } from '../legend-store';
import { useMutation } from '../use-mutation';

export const useHandleSelectCombobox = () => {
  const { runMutate } = useMutation();

  const { selected, row, field } = comboboxStore$.get();

  const startSelectedRef = React.useRef<string | string[]>();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSelect = (value: Row) => {
    if (!row) return;
    if (!field) throw new Error('no field');

    const isManyToManyRelation = field?.relation?.manyToManyRelation;

    if (field.type === 'Boolean' && row) {
      const mutation = handleSelectUpdate({
        field,
        row,
        value,
        selected: selected ?? [],
      });

      runMutate({
        mutation: mutation,
      });
    } else {
      const selectedId =
        typeof selected === 'string'
          ? selected
          : Array.isArray(selected)
          ? selected.map((v) => v.id)
          : (selected as Row)?.id;

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
            ? updateManyToManyRelation(selected ?? [], value).map(
                (v) => v['id']
              )
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
                  if (item['id'] === row.id) {
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
        store$.deselectRelationField();
      }, 100);
    }
  };

  return { handleSelect };
};

function updateManyToManyRelation(
  currentValues: RecordType[],
  newValue: RecordType
) {
  const existingIndex = currentValues.findIndex(
    (value) => value['id'] === newValue['id']
  );
  return existingIndex !== -1
    ? currentValues.filter((_, index) => index !== existingIndex)
    : [...currentValues, newValue];
}
