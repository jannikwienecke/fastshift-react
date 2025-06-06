import { BaseViewConfigManagerInterface } from './base-view-config';
import { FieldConfig } from './types';

export type FormManagerInterface = {
  getFormFieldList: () => FieldConfig[];
};

export class FormManager implements FormManagerInterface {
  constructor(private base: BaseViewConfigManagerInterface) {}
  getFormFieldList(): FieldConfig[] {
    return this.base
      .getViewFieldList()
      .filter((field) => !field.isId)
      .filter((field) => !(!field.relation && field.isRelationalIdField))
      .filter((field) => field.relation?.type !== 'manyToMany');
  }
}
