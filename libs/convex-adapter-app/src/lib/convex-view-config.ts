import {
  BaseViewConfigManager,
  ConvexViewConfig,
  SearchableField,
} from '@apps-next/core';

export class ConvexViewConfigManager extends BaseViewConfigManager<ConvexViewConfig> {
  getSearchableField(): SearchableField | undefined {
    return this.viewConfig.query?.searchableField;
  }
}
