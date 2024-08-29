import { ComboboxGetPropsOptions } from '@apps-next/ui';
import { useSetAtom } from 'jotai';
import {
  updateValuesAtom,
  getStateByAtom,
  debouncedQueryAtom,
} from '../ui-adapter/combox-adapter/combobox.store';
import { useView } from '../use-view';
import { useMutation } from '../use-mutation';
import { RecordType } from '@apps-next/core';

export const useHandleSelectCombobox = () => {
  const { mutate } = useMutation();

  const updateValues = useSetAtom(updateValuesAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);

  const getStateBy = useSetAtom(getStateByAtom);

  const { viewConfigManager } = useView();

  const handleSelect = ({
    value,
    fieldName,
    rowId,
  }: Parameters<ComboboxGetPropsOptions['onSelect']>[0]) => {
    const field = viewConfigManager.getFieldBy(fieldName);
    const state = getStateBy({ fieldName, rowId });

    if (!field.relation || !state) return;

    const relationalRow = state.data.getRowById(value.id);
    const isManyToManyRelation = field.relation.manyToManyRelation;

    setTimeout(() => {
      // prevent seeing the flash of disappearing input text
      setDebouncedValue({
        query: '',
        fieldName: rowId + fieldName,
      });
    }, 100);

    updateValues({
      fieldName: rowId + fieldName,
      state: {
        selected: value,
        open: false,
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

  return handleSelect;
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
