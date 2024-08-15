import { SearchableField, ViewFieldConfig } from '@apps-next/core';
import { ConvexSchemaType } from './_internal/types.convex';
import { generateSearchableFieldsFromConvexSchema } from './convex-searchable-fields';
import { ConvexViewConfigManager } from './convex-view-config';
import { generateViewFieldsFromConvexSchema } from './convex-view-fields';

export class ConvexViewManager<TDataModel extends ConvexSchemaType> {
  viewFields: Record<string, ViewFieldConfig> | null;
  searchableFields: Record<string, SearchableField> | null;
  viewManager: ConvexViewConfigManager | null = null;

  constructor(private convexSchema: TDataModel) {
    this.searchableFields =
      generateSearchableFieldsFromConvexSchema(convexSchema);
    this.viewFields = generateViewFieldsFromConvexSchema(convexSchema);
  }
}
