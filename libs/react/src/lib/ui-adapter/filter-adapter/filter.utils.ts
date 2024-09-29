import {
  ComboxboxItem,
  FieldConfig,
  FilterDateType,
  FilterType,
  Row,
} from '@apps-next/core';
import { isValidISOString } from './date.utils';
import { MONTHS, QUARTERS } from './filter.constants';
import { initOperator } from './filter.operator';
import operatorMap, { operators } from './filter.operator.define';
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
      operator: initOperator(filter.field, value),
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
    const value = filter?.type === 'primitive' ? filter.value?.raw : '';

    return value;
  };

  const getValues = (filter: FilterType) => {
    const value = filter?.type === 'relation' ? filter.values : [];

    return value;
  };

  return {
    create: from,
    update,
    getValue,
    getValues,
  };
};

export const filterHelper = (value: string) => {
  const getYearFilterValue = () =>
    ['201', '202', '203'].some((year) => value.includes(year));

  const getMonthFilterValue = () =>
    MONTHS.find((month) => value.includes(month.toLowerCase()));

  const getQuarterFilterValue = () =>
    QUARTERS.find((quarter) => value.includes(quarter.toLowerCase()));

  const isIsoDate = isValidISOString(value);
  return {
    year: getYearFilterValue(),
    month: getMonthFilterValue(),
    quarter: getQuarterFilterValue(),
    isIsoDate,
  };
};

export const dateOperator = (value: string, date?: FilterDateType | null) => {
  const { year, month, quarter } = filterHelper(value);
  let operator = operatorMap.before;

  if (
    !date ||
    date.unit === 'today' ||
    date.unit === 'tomorrow' ||
    date.unit === 'yesterday' ||
    year ||
    month ||
    quarter
  ) {
    operator = operatorMap.is;
  } else if (
    date &&
    (date.unit === 'week' || date.unit === 'month' || date.unit === 'year')
  ) {
    if (!date.value || (date.value === -1 && date.operator === 'equal to')) {
      operator = operatorMap.within;
    }
  } else if (value.includes('ago')) {
    operator = operatorMap.after;
  }

  return operator;
};

export const stringsToComboxboxItems = (strings: string[]) => {
  return strings.map((string) => ({
    id: string,
    label: string,
  }));
};
