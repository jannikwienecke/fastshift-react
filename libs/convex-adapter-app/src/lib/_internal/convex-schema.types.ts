export type ConvexFieldValidator = {
  isOptional: 'required' | 'optional';
  isConvexValidator: true;
  kind: string;
  tableName?: string;
  element?: ConvexFieldValidator;
  members?: Array<{
    isOptional: 'required';
    isConvexValidator: true;
    kind: 'literal';
    value: string;
  }>;
};

export type ConvexTableValidator = {
  isOptional: 'required';
  isConvexValidator: true;
  kind: 'object';
  fields: Record<string, ConvexFieldValidator>;
};

export type ConvexSearchIndex = {
  indexDescriptor: string;
  searchField: string;
  filterFields: string[];
};

export type ConvexTable = {
  indexes: unknown[];
  searchIndexes: ConvexSearchIndex[];
  vectorIndexes: unknown[];
  validator: ConvexTableValidator;
};

export type ConvexSchema = Record<string, ConvexTable>;
