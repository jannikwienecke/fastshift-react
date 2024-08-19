import { BaseViewConfigManager, SearchableField } from '@apps-next/core';
import { ConvexViewConfig } from './convex-create-view-config';

export class ConvexViewConfigManager extends BaseViewConfigManager<ConvexViewConfig> {
  override getSearchableField(): SearchableField | undefined {
    return this.viewConfig.query?.searchableFields;
  }
}
