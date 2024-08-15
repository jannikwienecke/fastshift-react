import { FieldType } from '@apps-next/core';

export const MappingConvexToFieldType: Record<string, FieldType> = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date',
  id: 'Reference',
  float64: 'Number',
  union: 'Union',
};
