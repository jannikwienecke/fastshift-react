import { FieldConfig, Row, useStoreDispatch } from '@apps-next/core';
import { FieldValue } from './render-field-value';

export const ListFieldValue = ({
  row,
  field,
}: {
  row: Row;
  field: FieldConfig;
}) => {
  const dispatch = useStoreDispatch();
  return (
    <span
      style={{
        cursor: 'default',
      }}
      onClick={(e) => {
        if (!field) return;
        if (!field.relation && !field.enum && field.type !== 'Boolean') return;

        const rect = e.currentTarget.getBoundingClientRect();

        dispatch({
          type: 'SELECT_RELATIONAL_FIELD',
          field,
          row,
          selected: row.getValue(field.name),
          rect,
        });
      }}
    >
      <FieldValue field={field} componentType="list" row={row} />
    </span>
  );
};
