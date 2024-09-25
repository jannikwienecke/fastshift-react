import { FilterOperatorType } from '@apps-next/core';
import { OperatorFns, SearchFilterBuilder } from './types.convex';

export const operatorMap: Partial<{
  [key in FilterOperatorType['label']]: keyof OperatorFns;
}> = {
  is: 'eq',
  'is any of': 'eq',
  'is not': 'neq',
  'is not any of': 'neq',
};

export const queryBuilder = (
  q: SearchFilterBuilder,
  operator: FilterOperatorType
) => {
  const _operator = operatorMap[operator.label];
  if (!_operator) {
    throw new Error('Operator not found');
  }

  if (!_operator) {
    throw new Error('Operator not found1');
  }

  return q[_operator];
};

export const getOperator = (operator: FilterOperatorType) => {
  const _operator = operatorMap[operator.label];

  if (!_operator) {
    throw new Error('Operator not found');
  }
  return _operator;
};
