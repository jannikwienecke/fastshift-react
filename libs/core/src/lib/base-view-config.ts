import { invarant } from './core-utils';
import {
  BaseViewConfigManagerInterface,
  FieldConfig,
  SearchableField,
  ViewConfigType,
} from './types';

export class BaseViewConfigManager<
  TViewConfig extends ViewConfigType = ViewConfigType
> implements BaseViewConfigManagerInterface<TViewConfig>
{
  viewConfig: TViewConfig;

  constructor(viewConfig: TViewConfig) {
    this.viewConfig = viewConfig;
  }

  getTableName(): string {
    return this.viewConfig.tableName as string;
  }

  getViewName(): string {
    return this.viewConfig.viewName as string;
  }

  getDisplayFieldLabel(): string {
    invarant(!!this.viewConfig.displayField, 'displayField is required');
    return this.viewConfig.displayField.field as string;
  }

  getSearchableField(): SearchableField | undefined {
    return undefined;
  }

  getViewFieldList(): FieldConfig[] {
    return Object.values(this.viewConfig.viewFields);
  }

  getDbProvider(): 'convex' | 'prisma' {
    return this.viewConfig.dbProvider;
  }
}
