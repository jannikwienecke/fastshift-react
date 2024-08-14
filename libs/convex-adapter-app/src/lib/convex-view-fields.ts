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
          ([fieldName, fieldData]) => [
            fieldName,
            {
              type: MappingConvexToFieldType[(fieldData as any).kind],
              name: fieldName,
            },
          ]
        )
      ),
    ])
  );
};
