import {
  DataItem,
  DataRow,
  FieldConfig,
  RecordType,
  useStoreDispatch,
} from '@apps-next/core';
import { FieldValue } from './render-field-value';

export const ListFieldValue = ({
  row,
  field,
  value,
}: {
  row: DataRow;
  field: FieldConfig;
  value: DataItem<RecordType>;
}) => {
  const dispatch = useStoreDispatch();
  return (
    <span
      style={{
        cursor: 'default',
      }}
      onClick={(e) => {
        if (!field) return;
        if (!field.relation) return;

        const rect = e.currentTarget.getBoundingClientRect();

        dispatch({
          type: 'SELECT_RELATIONAL_FIELD',
          field,
          row,
          value: row.getItem(field.name),
          rect,
        });
      }}
    >
      <FieldValue
        fieldName={field.name as string}
        componentType="list"
        row={row}
      />
    </span>
  );
};
