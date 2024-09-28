import { FieldConfig, Row } from '@apps-next/core';
import { FieldValue } from './render-field-value';
import { useStoreDispatch } from '../store.ts';
import { store$ } from '../legend-store/legend.store';

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

        store$.selectRelationField({
          field,
          row,
          selected: row.getValue(field.name),
          rect,
        });

        dispatch({
          type: 'SELECT_RELATIONAL_FIELD',
          field,
          row,
          selected: row.getValue(field.name),
          rect,
        });
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <FieldValue field={field} componentType="list" row={row} />
    </span>
  );
};
