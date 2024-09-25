import { IndexField, SearchableField } from '@apps-next/core';
import { ConvexSchema } from './_internal/convex-schema.types';

export const generateSearchableFieldsFromConvexSchema = (
  convexSchema: ConvexSchema
) => {
  return Object.entries(convexSchema).reduce((acc, [tableName, tableData]) => {
    for (const searchIndex of tableData.searchIndexes) {
      if (searchIndex?.searchField && searchIndex?.indexDescriptor) {
        if (acc[tableName]) {
          acc[tableName].push({
            field: searchIndex.searchField,
            name: searchIndex.indexDescriptor,
            filterFields: searchIndex.filterFields,
          } satisfies SearchableField);
        } else {
          acc[tableName] = [
            {
              field: searchIndex.searchField,
              name: searchIndex.indexDescriptor,
              filterFields: searchIndex.filterFields,
            } satisfies SearchableField,
          ];
        }
      }
    }

    return acc;
  }, {} as Record<string, SearchableField[]>);
};

export const generateIndexFieldsFromConvexSchema = (
  convexSchema: ConvexSchema
) => {
  return Object.entries(convexSchema).reduce((acc, [tableName, tableData]) => {
    for (const searchIndex of tableData.indexes) {
      if (searchIndex?.fields && searchIndex?.indexDescriptor) {
        if (acc[tableName]) {
          acc[tableName].push({
            fields: searchIndex.fields,
            name: searchIndex.indexDescriptor,
          } satisfies IndexField);
        } else {
          acc[tableName] = [
            {
              fields: searchIndex.fields,
              name: searchIndex.indexDescriptor,
            } satisfies IndexField,
          ];
        }
      }
    }

    return acc;
  }, {} as Record<string, IndexField[]>);
};
