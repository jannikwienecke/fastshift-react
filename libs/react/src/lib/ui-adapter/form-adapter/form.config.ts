import { FieldType } from '@apps-next/core';
import {
  StringInput,
  BooleanInput,
  EnumInput,
  OneToOneSelectInput,
  ComboxboxItem,
} from '@apps-next/ui';

export const FORM_INPUT_DICT: {
  [key in FieldType]: React.FC<any>;
} = {
  String: StringInput,
  Number: StringInput,
  Boolean: BooleanInput,
  Date: StringInput,
  Reference: StringInput,
  OneToOneReference: OneToOneSelectInput,
  Union: StringInput,
  Enum: EnumInput,
};

export const FORM_DEFAULT_VALUE_DICT: {
  [key in FieldType]:
    | string
    | number
    | boolean
    | Date
    | undefined
    | ComboxboxItem;
} = {
  String: '',
  Number: 0,
  Boolean: false,
  Date: new Date(),
  // FIX THIS
  // Reference: 'j974cpqvkwtw1rxpm6pk99kb516z38ed',
  Reference: 'cm04vi2f3000uenx6gk4la322',
  OneToOneReference: undefined,
  Union: '',
  Enum: undefined,
};
