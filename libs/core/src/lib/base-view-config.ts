import { UiViewConfig } from './config.store';
import { invarant } from './core-utils';
import { t } from './translations';

import {
  FieldConfig,
  IncludeConfig,
  IndexField,
  RecordErrors,
  RecordType,
  RegisteredViews,
  SearchableField,
  ViewConfigType,
  ViewFieldConfig,
} from './types';

import { z } from 'zod';

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
  getSortingField(name: string): FieldConfig | undefined;
  getIndexFields(): IndexField[];
  getSoftDeleteIndexField(): SearchableField | undefined;
  getRelationFieldByTableName(tableName: string): FieldConfig;
  getIncludeFields(): IncludeConfig[string];
  getManyToManyField(key: string): FieldConfig | undefined;
  getViewByFieldName(
    fieldName: string,
    registeredViews: RegisteredViews
  ): ViewConfigType | undefined;
  getUiViewConfig: () => UiViewConfig[string];
  validateField: (field: FieldConfig, value: unknown) => string | undefined;
  validateRecord: (
    record: RecordType,
    partialRecord?: true
  ) => RecordErrors | null;

  modelConfig?: ModelConfig;
}

export class BaseViewConfigManager<
  TViewConfig extends ViewConfigType = ViewConfigType,
  KUiViewConfig extends UiViewConfig = UiViewConfig
> implements BaseViewConfigManagerInterface
{
  viewConfig: TViewConfig;
  uiViewConfig: KUiViewConfig;

  constructor(
    viewConfig: TViewConfig,
    uiViewConfig: KUiViewConfig = {} as KUiViewConfig,
    public modelConfig?: ModelConfig
  ) {
    this.viewConfig = viewConfig;
    this.uiViewConfig = uiViewConfig;
    this.modelConfig = modelConfig;
  }

  getTableName(): string {
    return this.viewConfig.tableName as string;
  }

  getViewName(): string {
    return this.viewConfig.viewName as string;
  }

  getUiViewConfig(): KUiViewConfig[string] {
    return this.uiViewConfig[
      this.getTableName() as string
    ] as KUiViewConfig[string];
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

  getViewFieldList(options?: {
    includeSystemFields?: boolean;
    includeSoftDeleteField?: boolean;
  }): FieldConfig[] {
    return Object.values(this.viewConfig?.viewFields ?? {}).filter((f) => {
      const isSoftDeleteField = this.getSoftDeleteField() === f.name;
      if (isSoftDeleteField && !options?.includeSoftDeleteField) return false;

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

  getSortingField(name?: string): FieldConfig | undefined {
    return name
      ? this.getFieldByRelationFieldName(name.toString()) ||
          this.getFieldBy(name.toString())
      : undefined;
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
    const view = Object.values(registeredViews).find(
      (view) => view?.tableName === fieldName
    );

    return view;
  }

  validateField(field: FieldConfig, value: unknown): string | undefined {
    if (!field.isRequired && value === undefined) return undefined;

    if (
      field.isRequired &&
      (value === undefined || value === '' || value === null)
    ) {
      return `Field ${field.label} is required`;
    }

    if (field.validator) {
      const zod = field.validator() as z.ZodType;
      const parseResult = zod.safeParse(value);
      if (parseResult.success) {
        return undefined;
      }

      const out =
        parseResult.error.errors?.[0]?.message ?? 'Something went wrong';

      return field.validationErrorMessage
        ? field.validationErrorMessage(t)
        : out;
    }

    return undefined;
  }

  validateRecord(
    record: RecordType | undefined | null,
    partialRecord?: boolean
  ): RecordErrors | null {
    if (!record) return null;

    const fields = this.getViewFieldList();

    const errors = fields.reduce((prev, field) => {
      let value = record[field.name];
      if (partialRecord && value === undefined) {
        return { ...prev };
      }

      value = field.isDateField ? new Date(value) : value;

      const fieldnameRelation = field.relation?.fieldName;

      if (value === undefined && fieldnameRelation) {
        value = record[fieldnameRelation];
      }

      const error = this.validateField(field, value);
      if (error) {
        return {
          ...prev,
          [field.name]: { error },
        };
      }
      return prev;
    }, {} as RecordErrors);

    if (Object.values(errors).length === 0) return null;

    return errors;
  }
}
