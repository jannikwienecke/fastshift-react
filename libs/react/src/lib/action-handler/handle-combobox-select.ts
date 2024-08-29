import { ComboboxAdapterOptions } from '@apps-next/ui';
import { useSetAtom } from 'jotai';
import {
  updateValuesAtom,
  getStateByAtom,
  debouncedQueryAtom,
} from '../ui-adapter/combox-adapter/combobox.store';
import { useView } from '../use-view';
import { useMutation } from '../use-mutation';
import { RecordType, useStoreDispatch } from '@apps-next/core';
import { useQueryData } from '../use-query-data';

export const useHandleSelectCombobox = () => {
  const { mutate } = useMutation();

  const updateValues = useSetAtom(updateValuesAtom);

  const dispatch = useStoreDispatch();

  const setDebouncedValue = useSetAtom(debouncedQueryAtom);
  const { dataModel } = useQueryData();
  const getStateBy = useSetAtom(getStateByAtom);

  const { viewConfigManager } = useView();

  const handleSelect = ({
    value,
    fieldName,
    rowId,
  }: Parameters<ComboboxAdapterOptions['onSelect']>[0]) => {
    const field = viewConfigManager.getFieldBy(fieldName);
    const state = getStateBy({ fieldName, rowId });

    if (!field.relation || !state) return;

    const relationalRow = state.data.getRowById(value.id.toString());
    const row = dataModel.getRowById(rowId);
    const currentId = row.getItem(fieldName).id;

    const isManyToManyRelation = field.relation.manyToManyRelation;
    const ids = isManyToManyRelation ? (currentId as any as string[]) : [];

    const selected = isManyToManyRelation
      ? ids.includes(value.id.toString())
        ? ids.filter((id) => id !== value.id.toString())
        : [...currentId, value.id]
      : value;

    row.updateItemId(fieldName, selected as any);

    dispatch({ type: 'DESELECT_RELATIONAL_FIELD' });

    setTimeout(() => {
      // prevent seeing the flash of disappearing input text
      setDebouncedValue({
        query: '',
        fieldName: rowId + fieldName,
      });
    }, 100);

    // TODO: FIX TYPe here
    updateValues({
      fieldName: rowId + fieldName,
      state: isManyToManyRelation
        ? {
            selected: {
              id: selected as string[],
              label: '',
            },
          }
        : {
            open: false,
            selected: null,
          },
    });

    mutate({
      mutation: {
        type: 'UPDATE_RECORD',
        handler: (items) => {
          return items.map((item) => {
            if (item.id === rowId) {
              return {
                ...item,
                [fieldName]: isManyToManyRelation
                  ? updateManyToManyRelation(
                      item[fieldName],
                      relationalRow.getRawData()
                    )
                  : relationalRow.getRawData(),
              };
            }
            return item;
          });
        },
        payload: {
          id: rowId,
          record: {
            [field.relation.fieldName]: value.id,
          },
        },
      },
    });
  };

  const handleClose = () => {
    dispatch({ type: 'DESELECT_RELATIONAL_FIELD' });
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
