import { invarant } from './core-utils';
import {
  FieldConfig,
  IncludeConfig,
  IndexField,
  RegisteredViews,
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
  getSearchableFields(): SearchableField[] | undefined;
  getPrimarySearchField(): string | undefined;
  getTableName(): string;
  getViewName(): string;
  getViewFieldList(): FieldConfig[];
  getRelationalFieldList(): FieldConfig[];
  getFieldBy(fieldName: string): FieldConfig;
  getIndexFields(): IndexField[];
  getRelationFieldByTableName(tableName: string): FieldConfig;
  getIncludeFields(): IncludeConfig[string];
  getManyToManyField(key: string): FieldConfig | undefined;

  modelConfig?: ModelConfig;
}

export class BaseViewConfigManager<
  TViewConfig extends ViewConfigType = ViewConfigType<any>
> implements BaseViewConfigManagerInterface<any>
{
  viewConfig: TViewConfig;

  constructor(viewConfig: TViewConfig, public modelConfig?: ModelConfig) {
    this.viewConfig = viewConfig;
    this.modelConfig = modelConfig;
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

  getSearchableFields(): SearchableField[] | undefined {
    return this.viewConfig.query?.searchableFields;
  }

  getIndexFields(): IndexField[] {
    return this.viewConfig.query?.indexFields ?? [];
  }

  getPrimarySearchField() {
    return (this.viewConfig.query?.primarySearchField as string) ?? undefined;
  }

  // getPrimarySearchField add

  getViewFieldList(): FieldConfig[] {
    // return Object.values(this.modelConfig?.viewFields ?? {});
    return Object.values(this.viewConfig?.viewFields ?? {});
  }

  getRelationalFieldList(): FieldConfig[] {
    return Object.values(this.viewConfig.viewFields ?? {}).filter(
      (f) => f.relation
    );
  }

  getFieldBy(fieldName: string): FieldConfig {
    const field = Object.values(this.viewConfig.viewFields).find(
      (field) => field.name.toLowerCase() === fieldName.toLowerCase()
    );

    invarant(!!field, `Field ${fieldName} not found`);

    return field as FieldConfig;
  }

  getRelationFieldByTableName(tableName: string): FieldConfig {
    const field = this.getViewFieldList().find(
      (f) =>
        f.relation?.manyToManyRelation === tableName ||
        f.relation?.tableName === tableName
    );

    if (!field) {
      throw new Error(`Field ${tableName} not found`);
    }

    return field as FieldConfig;
  }

  getIncludeFields(): IncludeConfig[string] {
    return this.viewConfig.includeFields;
  }

  getManyToManyField(key: string): FieldConfig | undefined {
    return this.getViewFieldList().find(
      (f) => f.relation?.manyToManyRelation === key
    );
  }

  getIncludeFieldsForRelation(
    tableName: string,
    registeredViews: RegisteredViews
  ): IncludeConfig[string] {
    const view = Object.values(registeredViews).find(
      (view) => view?.tableName === tableName
    );

    if (!view) {
      return [];
    }

    return view.includeFields.filter((field) => {
      const isList = view.viewFields[field]?.isList;
      if (isList) {
        return false;
      }

      return true;
    });
  }
}
