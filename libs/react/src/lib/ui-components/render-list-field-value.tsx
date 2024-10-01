import { FieldConfig, Row } from '@apps-next/core';
import { store$ } from '../legend-store/legend.store';
import { FieldValue } from './render-field-value';

export const ListFieldValue = ({
  row,
  field,
}: {
  row: Row;
  field: FieldConfig;
}) => {
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
