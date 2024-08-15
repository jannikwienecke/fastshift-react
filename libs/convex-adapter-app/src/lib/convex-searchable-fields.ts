import { SearchableField } from '@apps-next/core';
import { ConvexSchemaType } from './_internal/types.convex';

export const generateSearchableFieldsFromConvexSchema = (
  convexSchema: ConvexSchemaType
) => {
  return Object.entries(convexSchema.tables).reduce(
    (acc, [tableName, tableData]) => {
      const searchIndex = tableData.searchIndexes?.[0];

      if (searchIndex?.searchField && searchIndex?.indexDescriptor) {
        acc[tableName] = {
          field: searchIndex.searchField,
          name: searchIndex.indexDescriptor,
          filterFields: searchIndex.filterFields,
        } satisfies SearchableField;
      }

      return acc;
    },
    {} as Record<string, SearchableField>
  );
};
