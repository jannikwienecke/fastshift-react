import { invarant } from './core-utils';
import {
  FieldConfig,
  IncludeConfig,
  SearchableField,
  ViewConfigType,
  ViewFieldConfig,
} from './types';

import { FormManager, FormManagerInterface } from './form-manager';

export type ModelConfig = {
  searchableFields?: SearchableField;
  viewFields: ViewFieldConfig;
};

export interface BaseViewConfigManagerInterface<
  TViewConfig extends ViewConfigType = ViewConfigType
> {
  viewConfig: TViewConfig;
  getDisplayFieldLabel(): string;
  getSearchableField(): SearchableField | undefined;
  getTableName(): string;
  getViewName(): string;
  getViewFieldList(): FieldConfig[];
  getFieldBy(fieldName: string): FieldConfig;
  modelConfig?: ModelConfig;
  form: FormManagerInterface;
}

export class BaseViewConfigManager<
  TViewConfig extends ViewConfigType = ViewConfigType<any>
> implements BaseViewConfigManagerInterface<any>
{
  viewConfig: TViewConfig;

  constructor(
    viewConfig: TViewConfig,
    public modelConfig?: ModelConfig,
    public form: FormManagerInterface = new FormManager(this)
  ) {
    this.viewConfig = viewConfig;
    this.modelConfig = modelConfig;
    this.form = form;
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
    return this.modelConfig?.searchableFields;
  }

  getViewFieldList(): FieldConfig[] {
    // return Object.values(this.modelConfig?.viewFields ?? {});
    return Object.values(this.viewConfig?.viewFields ?? {});
  }

  getFieldBy(fieldName: string): FieldConfig {
    return this.viewConfig.viewFields[fieldName];
  }

  getIncludeFields(): IncludeConfig[string] {
    return this.viewConfig.includeFields;
  }
}
