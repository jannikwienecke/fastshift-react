import {
  ComboxboxItem,
  FieldConfig,
  FilterOperatorType,
  FilterType,
  Row,
} from '@apps-next/core';
import { dateUtils } from './date.utils';
import {
  defaultOperator,
  defaultOperatorMap,
  operatorMap,
  optionsOperatorMap,
} from './filter.operator.define';
import { dateOperator } from './filter.utils';

export const operator = () => {
  const value = (f: FilterType) => (f.type === 'primitive' ? f.value : null);
  const values = (f: FilterType) => (f.type === 'relation' ? f.values : null);

  const hasMoreThanOneValue = (f?: FilterType) => {
    if (!f) return false;

    const _values = values(f);
    return _values && _values.length > 1;
  };

  const _primitive = (filter: FilterType) => {
    if (!value(filter)) return null;

    return filter.operator || initOperator(filter.field, value(filter));
  };

  const _relation = (filter: FilterType) => {
    const _values = values(filter);
    if (!_values) return null;

    const hasMoreThanOneValue = _values.length > 1;

    if (isRelationNegateOperator(filter.operator)) {
      return hasMoreThanOneValue ? operatorMap.isNotAnyOf : operatorMap.isNot;
    }

    return hasMoreThanOneValue ? operatorMap.isAnyOf : operatorMap.is;
  };

  const get = (filter: FilterType) => {
    let operator: FilterOperatorType | null | undefined = null;
    if (filter.type === 'primitive') {
      operator = _primitive(filter);
    } else {
      operator = _relation(filter);
    }

    if (!operator) {
      throw new Error('Operator not found');
    }

    return operator;
  };

  const makeOptionsFrom = (
    field: FieldConfig,
    filter?: FilterType
  ): ComboxboxItem[] => {
    const operators = optionsOperatorMap[field.type];
    if (!operators) return [];

    const _isMany = hasMoreThanOneValue(filter);

    if (field.type === 'Date') {
      return getOptionsForDateField(field, filter);
    }

    return operators
      .filter((operator) => (_isMany ? operator.many : !operator.many))
      .map((operator) => ({
        id: operator.label,
        label: operator.label,
        icon: operator.icon,
      }));
  };

  return {
    value: (filter: FilterType) => get(filter),
    makeOptionsFrom,
  };
};

export const initOperator = (field: FieldConfig, value?: Row | null) => {
  if (field.type === 'Date') {
    return initDateOperator(field, value);
  }

  const operator = defaultOperatorMap[field.type];
  if (!operator) return defaultOperator;

  return operator;
};

export const isRelationNegateOperator = (operator: FilterOperatorType) => {
  return operator.label === 'is not' || operator.label === 'is not any of';
};

export const isEnumNegateOperator = (operator: FilterOperatorType) => {
  return operator.label === 'is not' || operator.label === 'is not any of';
};

export const initDateOperator = (field: FieldConfig, value?: Row | null) => {
  const operator = defaultOperatorMap[field.type];
  if (!operator) return defaultOperator;
  if (!value) return operator;

  const date = dateUtils.parseOption(value.raw, operator);

  return dateOperator(value.raw.toString().toLowerCase(), date);
};

export const getOptionsForDateField = (
  field: FieldConfig,
  filter?: FilterType
): ComboxboxItem[] => {
  const operators = optionsOperatorMap[field.type];
  const _operator = operators?.[0];
  if (!operators?.length || !_operator) return [];

  const value =
    filter?.type === 'primitive' && filter.value ? filter.value : null;

  const date = dateUtils.parseOption(value?.raw, _operator);

  const operator = dateOperator(value?.raw.toString().toLowerCase(), date);

  if (operator.label === 'is') {
    return [
      {
        id: operatorMap.is.label,
        label: operatorMap.is.label,
        icon: operatorMap.is.icon,
      },
      {
        id: operatorMap.isNot.label,
        label: operatorMap.isNot.label,
        icon: operatorMap.isNot.icon,
      },
    ];
  }

  if (operator.label === 'within') {
    return [
      {
        ...operator,
        id: operatorMap.within.label,
      },
    ];
  }

  return operators
    .filter((o) => o.label !== 'within')
    .map((operator) => ({
      id: operator.label,
      label: operator.label,
      icon: operator.icon,
    }));
};
