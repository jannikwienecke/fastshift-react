// const IS_OPERATOR: FilterOperatorType = {
//     label: 'is',
//     icon: EqualIcon,
//   };

import { FilterOperatorType } from './types/filter.types';

//   const BEFORE_OPERATOR: FilterOperatorType = {
//     label: 'before',
//     icon: CalendarArrowUp,
//   };

//   const WITHIN_OPERATOR: FilterOperatorType = {
//     label: 'within',
//     icon: CalendarArrowUp,
//   };

//   const AFTER_OPERATOR: FilterOperatorType = {
//     label: 'after',
//     icon: CalendarArrowDown,
//   };

//   const IS_NOT_OPERATOR: FilterOperatorType = {
//     label: 'is not',
//     icon: EqualNotIcon,
//   };

//   const IS_NOT_ANY_OF_OPERATOR: FilterOperatorType = {
//     label: 'is not any of',
//     icon: EqualNotIcon,
//     many: true,
//   };

//   const CONTAINS_OPERATOR: FilterOperatorType = {
//     label: 'contains',
//     icon: PlusIcon,
//   };

//   const DOES_NOT_CONTAIN_OPERATOR: FilterOperatorType = {
//     label: 'does not contain',
//     icon: CircleAlert,
//   };

//   const IS_ANY_OF_OPERATOR: FilterOperatorType = {
//     label: 'is any of',
//     icon: PlusIcon,
//     many: true,
//   };

//   export const {

//   }

type FilterLabel = FilterOperatorType['label'];
const IS_ANY_OF: FilterLabel = 'is any of' as const;
const IS_NOT_ANY_OF: FilterLabel = 'is not any of' as const;
const IS: FilterLabel = 'is' as const;
const IS_NOT: FilterLabel = 'is not' as const;
const CONTAINS: FilterLabel = 'contains' as const;
const DOES_NOT_CONTAIN: FilterLabel = 'does not contain' as const;
const BEFORE: FilterLabel = 'before' as const;
const AFTER: FilterLabel = 'after' as const;
const WITHIN: FilterLabel = 'within' as const;

export const operatorLabels = {
  IS_ANY_OF,
  IS_NOT_ANY_OF,
  IS,
  IS_NOT,
  CONTAINS,
  DOES_NOT_CONTAIN,
  BEFORE,
  AFTER,
  WITHIN,
} as const;
