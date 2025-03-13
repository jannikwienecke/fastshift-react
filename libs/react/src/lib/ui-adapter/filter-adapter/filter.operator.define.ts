import { FieldType, FilterOperatorType, operatorLabels } from '@apps-next/core';
import {
  CalendarArrowDown,
  CalendarArrowUp,
  CircleAlert,
  EqualIcon,
  EqualNotIcon,
  PlusIcon,
} from 'lucide-react';

const IS_OPERATOR: FilterOperatorType = {
  label: operatorLabels.IS,
  icon: EqualIcon,
};

const BEFORE_OPERATOR: FilterOperatorType = {
  label: operatorLabels.BEFORE,
  icon: CalendarArrowUp,
};

const WITHIN_OPERATOR: FilterOperatorType = {
  label: operatorLabels.WITHIN,
  icon: CalendarArrowUp,
};

const AFTER_OPERATOR: FilterOperatorType = {
  label: operatorLabels.AFTER,
  icon: CalendarArrowDown,
};

const IS_NOT_OPERATOR: FilterOperatorType = {
  label: operatorLabels.IS_NOT,
  icon: EqualNotIcon,
};

const IS_NOT_ANY_OF_OPERATOR: FilterOperatorType = {
  label: operatorLabels.IS_NOT_ANY_OF,
  icon: EqualNotIcon,
  many: true,
};

const CONTAINS_OPERATOR: FilterOperatorType = {
  label: operatorLabels.CONTAINS,
  icon: PlusIcon,
};

const DOES_NOT_CONTAIN_OPERATOR: FilterOperatorType = {
  label: operatorLabels.DOES_NOT_CONTAIN,
  icon: CircleAlert,
};

const IS_ANY_OF_OPERATOR: FilterOperatorType = {
  label: operatorLabels.IS_ANY_OF,
  icon: PlusIcon,
  many: true,
};

export const operatorMap = {
  is: IS_OPERATOR,
  isNot: IS_NOT_OPERATOR,
  contains: CONTAINS_OPERATOR,
  doesNotContain: DOES_NOT_CONTAIN_OPERATOR,
  isAnyOf: IS_ANY_OF_OPERATOR,
  isNotAnyOf: IS_NOT_ANY_OF_OPERATOR,
  before: BEFORE_OPERATOR,
  after: AFTER_OPERATOR,
  within: WITHIN_OPERATOR,
};

export const operators = Object.values(operatorMap);

export const defaultOperator = operatorMap.is;
export const defaultOperators = [
  operatorMap.is,
  operatorMap.isAnyOf,
  operatorMap.isNot,
  operatorMap.isNotAnyOf,
];

export const defaultOperatorMap: Partial<{
  [key in FieldType]: FilterOperatorType;
}> = {
  Boolean: defaultOperator,
  String: operatorMap.contains,
  Number: defaultOperator,
  Enum: defaultOperator,
  Date: operatorMap.before,
  Reference: defaultOperator,
  OneToOneReference: defaultOperator,
  Union: defaultOperator,
};

export const optionsOperatorMap: Partial<{
  [key in FieldType]: FilterOperatorType[];
}> = {
  Boolean: [operatorMap.is, operatorMap.isNot],
  String: [operatorMap.contains, operatorMap.doesNotContain],
  Number: [operatorMap.is, operatorMap.isNot],
  Enum: defaultOperators,
  Date: [operatorMap.before, operatorMap.after, operatorMap.within],
  Reference: defaultOperators,
  OneToOneReference: defaultOperators,
  Union: [operatorMap.is, operatorMap.isAnyOf],
};

export default operatorMap;
