import { BaseViewConfigManagerInterface } from './base-view-config';
import { FieldConfig } from './types';

export type FormManagerInterface = {
  getFormFieldList: () => FieldConfig[];
};

export class FormManager implements FormManagerInterface {
  constructor(private base: BaseViewConfigManagerInterface) {}
  getFormFieldList(): FieldConfig[] {
    // console.log(this.base.viewConfig);

    // console.log(
    //   this.base
    //     .getViewFieldList()
    //     .filter((field) => !field.isId)
    //     .filter((field) => !(!field.relation && field.isRelationalIdField))
    // );

    return this.base
      .getViewFieldList()
      .filter((field) => !field.isId)
      .filter((field) => !(!field.relation && field.isRelationalIdField));
  }
}
