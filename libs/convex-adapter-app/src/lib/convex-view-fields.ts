import { FieldConfig, TableRelationType } from '@apps-next/core';
import { ConvexSchemaType } from './_internal/types.convex';
import { MappingConvexToFieldType } from './convex-constants';

export const generateViewFieldsFromConvexSchema = (
  convexSchema: ConvexSchemaType
) => {
  return Object.fromEntries(
    Object.entries(convexSchema.tables).map(([tableName, tableData]) => [
      tableName,
      Object.fromEntries(
        Object.entries(tableData.validator.fields).map(
          ([fieldName, fieldData]) => {
            const isRequired = (fieldData as any).isOptional === 'required';

            const relation = (fieldData as any).tableName
              ? {
                  fieldName: fieldName,
                  tableName: (fieldData as any).tableName,
                  // TODO: FIX THIS
                  type: 'oneToMany' as const,
                }
              : undefined;

            const field: FieldConfig = {
              // FIX THIS -> USE CONVEX FIELD TYPE
              relation,
              isRequired,
              isRelationalIdField: relation ? true : false,
              type: MappingConvexToFieldType[(fieldData as any).kind],
              name: relation ? relation.fieldName : fieldName,
            };
            return [fieldName, field];
          }
        )
      ),
    ])
  );
};
