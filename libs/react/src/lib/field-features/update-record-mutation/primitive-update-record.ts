import {
  UpdateRecordMutation,
  UpdateRecordPayload,
} from './feature.updateRecord.shared';

export const PrimitiveFieldUpdate = ({
  field,
  row,
  value,
  selected,
}: UpdateRecordPayload): UpdateRecordMutation => {
  return {
    type: 'UPDATE_RECORD',
    payload: {
      id: row.id,
      record: {
        [field.name]: value.raw,
      },
    },
    handler: (items) => {
      return items.map((item) => {
        if (item.id === row.id) {
          const newValue = {
            ...item,
            [field.name]: value.raw,
          };
          return newValue;
        }
        return item;
      });
    },
  };
};
