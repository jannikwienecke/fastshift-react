import { SearchableField } from '@apps-next/core';
import { ConvexSchema } from './_internal/convex-schema.types';

export const generateSearchableFieldsFromConvexSchema = (
  convexSchema: ConvexSchema
) => {
  return Object.entries(convexSchema).reduce((acc, [tableName, tableData]) => {
    const searchIndex = tableData.searchIndexes?.[0];

    if (searchIndex?.searchField && searchIndex?.indexDescriptor) {
      acc[tableName] = {
        field: searchIndex.searchField,
        name: searchIndex.indexDescriptor,
        filterFields: searchIndex.filterFields,
      } satisfies SearchableField;
    }

    return acc;
  }, {} as Record<string, SearchableField>);
};
