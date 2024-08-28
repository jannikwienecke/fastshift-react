import { DataRow, FieldConfig, useStoreDispatch } from '@apps-next/core';
import { FieldValue } from './render-field-value';

export const ListFieldValue = ({
  row,
  field,
}: {
  row: DataRow;
  field: FieldConfig;
}) => {
  const dispatch = useStoreDispatch();

  return (
    <span
      role="button"
      onClick={() => {
        if (!field) return;
        if (!field.relation) return;

        dispatch({
          type: 'SELECT_RELATIONAL_FIELD',
          field,
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
