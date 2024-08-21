import { FieldType } from '@apps-next/core';
import { StringInput, BooleanInput } from '@apps-next/ui';

export const FORM_INPUT_DICT: {
  [key in FieldType]: React.FC<any>;
} = {
  String: StringInput,
  Number: StringInput,
  Boolean: BooleanInput,
  Date: StringInput,
  Reference: StringInput,
  Union: StringInput,
};

export const FORM_DEFAULT_VALUE_DICT: {
  [key in FieldType]: string | number | boolean | Date;
} = {
  String: '',
  Number: 0,
  Boolean: false,
  Date: new Date(),
  // FIX THIS
  Reference: 'j974cpqvkwtw1rxpm6pk99kb516z38ed',
  Union: '',
};
