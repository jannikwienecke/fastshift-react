import { BaseViewConfigManagerInterface } from './base-view-config';
import { FieldConfig } from './types';

export type FormManagerInterface = {
  getFormFieldList: () => FieldConfig[];
};

export class FormManager implements FormManagerInterface {
  constructor(private base: BaseViewConfigManagerInterface) {}
  getFormFieldList(): FieldConfig[] {
    // console.log(
    //   this.base
    //     .getViewFieldList()
    //     .filter((field) => !field.isId)
    //     .filter((field) => !(!field.relation && field.isRelationalIdField))
    // );

    // console.log(this.base.getViewFieldList());

    return this.base
      .getViewFieldList()
      .filter((field) => !field.isId)
      .filter((field) => !(!field.relation && field.isRelationalIdField))
      .filter((field) => field.relation?.type !== 'manyToMany');
  }
}
