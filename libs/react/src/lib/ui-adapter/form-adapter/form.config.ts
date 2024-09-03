import { ComboxboxItem, FieldType } from '@apps-next/core';

const StringInput = () => null;

export const FORM_INPUT_DICT: {
  [key in FieldType]: React.FC<any>;
} = {
  String: StringInput,
  Number: StringInput,
  Boolean: StringInput,
  Date: StringInput,
  Reference: StringInput,
  OneToOneReference: StringInput,
  Union: StringInput,
  Enum: StringInput,
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
