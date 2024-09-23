import { ComboxboxItem, FieldConfig, FilterType, Row } from '@apps-next/core';
import { initOperator } from './filter.operator';
import { operators } from './filter.operator.define';
import { SelectFilterValueAction } from './filter.store';

const isRelation = (field: FieldConfig) => {
  return (
    field.type === 'Reference' ||
    field.type === 'OneToOneReference' ||
    field.type === 'Union' ||
    field.type === 'Enum'
  );
};

export const filterUtil = () => {
  const from = (filter: SelectFilterValueAction) => {
    const type = isRelation(filter.field) ? 'relation' : 'primitive';
    const value = isRelation(filter.field) ? undefined : filter.value;
    const values = isRelation(filter.field) ? [filter.value] : undefined;

    return {
      type,
      values: values as Row[],
      value: value as Row,
      field: filter.field,
      operator: initOperator(filter.field),
    } satisfies FilterType;
  };

  const update = (filter: FilterType, operator: ComboxboxItem): FilterType => {
    const newOperator = operators.find((o) => o.label === operator.id);

    if (!newOperator) {
      throw new Error('Operator not found');
    }

    return {
      ...filter,
      operator: newOperator,
    };
  };

  const getValue = (filter: FilterType) => {
    const value = filter?.type === 'primitive' ? filter.value.raw : '';

    return value;
  };

  return {
    create: from,
    update,
    getValue,
  };
};
