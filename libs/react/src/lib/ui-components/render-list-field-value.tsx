import { FieldConfig, Row } from '@apps-next/core';
import { store$ } from '../legend-store/legend.store';
import { FieldValue } from './render-field-value';
import { currentView$ } from '../legend-store';

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

        if (
          !field.relation &&
          !field.enum &&
          field.type !== 'Boolean' &&
          field.type !== 'Date'
        ) {
          return null;
        }

        e.stopPropagation();
        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();

        if (
          field.relation?.type === 'manyToMany' ||
          currentView$.get().ui?.showComboboxOnClickRelation
        ) {
          store$.selectRelationField({
            field,
            row,
            rect,
          });
        } else if (
          !field.isDateField &&
          !field.enum &&
          field.relation &&
          !field.relation.manyToManyModelFields?.length
        ) {
          const defaultFn = () => {
            store$.navigation.state.set({
              type: 'navigate',
              view: field.relation?.tableName ?? '',
              id: row.raw?.[field.name].id,
            });
          };

          if (store$.list.onClickRelation.get()) {
            store$.list.onClickRelation.fn?.(field, row, () => {
              defaultFn();
            });
          } else {
            defaultFn();
          }
        } else {
          store$.selectRelationField({
            field,
            row,
            rect,
          });
        }

        return;
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <FieldValue field={field} componentType="list" row={row} />
    </span>
  );
};
