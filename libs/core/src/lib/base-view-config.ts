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
  getViewFieldList(options?: { includeSystemFields?: boolean }): FieldConfig[];
  getRelationalFieldList(): FieldConfig[];
  getFieldBy(fieldName: string): FieldConfig;
  getFieldByRelationFieldName(relationFieldName: string): FieldConfig;
  getIndexFields(): IndexField[];
  getSoftDeleteIndexField(): SearchableField | undefined;
  getRelationFieldByTableName(tableName: string): FieldConfig;
  getIncludeFields(): IncludeConfig[string];
  getManyToManyField(key: string): FieldConfig | undefined;
  getViewByFieldName(
    fieldName: string,
    registeredViews: RegisteredViews
  ): ViewConfigType | undefined;

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

  getSoftDeleteField(): string | undefined {
    return this.viewConfig.mutation?.softDeleteField as string | undefined;
  }

  getSoftDeleteIndexField(): SearchableField | undefined {
    const softDeleteField = this.getSoftDeleteField();
    if (!softDeleteField && this.viewConfig.mutation?.softDelete) {
      throw new Error(
        'Soft delete field is not set. Please set the soft delete field in the view config.'
      );
    }

    if (!softDeleteField) return undefined;

    const field = this.viewConfig.query?.indexFields?.find((f) =>
      f.fields.find((f) => f === softDeleteField)
    );

    if (!field) {
      throw new Error(
        `Soft delete field ${softDeleteField} is not found in index fields.`
      );
    }

    return {
      name: field.name,
      field: field.fields?.[0] as string,
      filterFields: field.fields ?? [],
    };
  }

  getPrimarySearchField() {
    return (this.viewConfig.query?.primarySearchField as string) ?? undefined;
  }

  // getPrimarySearchField add

  getViewFieldList(options?: { includeSystemFields?: boolean }): FieldConfig[] {
    // return Object.values(this.modelConfig?.viewFields ?? {});
    return Object.values(this.viewConfig?.viewFields ?? {}).filter((f) => {
      return options?.includeSystemFields ? true : !f.isSystemField;
    });
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

  getFieldByRelationFieldName(relationFieldName: string): FieldConfig {
    const field = Object.values(this.viewConfig.viewFields).find(
      (field) =>
        field.relation?.fieldName.toLowerCase() ===
        relationFieldName.toLowerCase()
    );

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
      const isList = view.viewFields[field.toString()]?.isList;
      if (isList) {
        return false;
      }

      return true;
    });
  }

  getViewByFieldName(
    fieldName: string,
    registeredViews: RegisteredViews
  ): ViewConfigType | undefined {
    // const field = this.getFieldBy(fieldName);
    // if (!field.relation) return undefined;

    const view = Object.values(registeredViews).find(
      (view) => view?.tableName === fieldName
    );

    return view;
  }
}
