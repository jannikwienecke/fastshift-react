import { BaseViewConfigManagerInterface } from './base-view-config';
import { makeRow } from './data-model';
import { QUERY_KEY_PREFIX } from './types';
import {
  FilterOperatorTypePrimitive,
  FilterOperatorTypeRelation,
  FilterType,
} from './types/filter.types';

export const invarant = (condition: boolean, message: string) => {
  const prefix = 'Invariant failed';

  if (condition) {
    return;
  }

  const label = message ? `${prefix}: ${message}` : prefix;
  throw new Error(label);
};

export const waitFor = (ms: number) => {
  const env = process.env['NODE_ENV'];
  if (!env || env === 'development') {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return Promise.resolve();
};

export const makeQueryKey = ({
  viewName,
  query,
  relation,
  filters,
}: {
  viewName: string | undefined;
  query?: string | undefined;
  relation?: string | undefined;
  filters?: string | undefined;
}) => {
  return [
    QUERY_KEY_PREFIX,
    viewName,
    query ?? '',
    relation ? '_relational_' + relation : '',
    filters ?? '',
  ];
};

export const firstUpper = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Add this new code
declare global {
  interface String {
    firstUpper(): string;
  }
}

String.prototype.firstUpper = function (this: string) {
  return firstUpper(this);
};

// TODO: EXTREAC INTO OWN FILE
export const convertFiltersForBackend = (filters: FilterType[]): string => {
  return filters
    .map((filter) => {
      const fieldId = encodeURIComponent(filter.field.name);
      const operator = encodeURIComponent(filter.operator.label);

      if (filter.type === 'relation') {
        const values = filter.values
          .map((row) => encodeURIComponent(row.id))
          .join(',');
        return `filter[]=${fieldId}:${operator}:${values}:${filter.type}`;
      } else {
        const value = encodeURIComponent(filter.value.id);
        return `filter[]=${fieldId}:${operator}:${value}:${filter.type}`;
      }
    })
    .join('&');
};

// filter[]=projects:is%20any%20of:j97e566mamt3b742cjdm45vbm570qhtp,j975gbehqm6g5dr9yya1az3jcd70p30b
// how to parse this string into a filter object?
export const parseFilterStringForServer = (
  filterString: string,
  viewConfigManager: BaseViewConfigManagerInterface
): FilterType[] => {
  if (!filterString) return [];

  const filters = filterString.split('&');
  return filters
    .map((filter) => {
      const [, fieldIdWithPrefix, operator, value, type] =
        filter.match(/filter\[\]=([^:]+):([^:]+):([^:]+):([^:]+)/) || [];
      if (!fieldIdWithPrefix) {
        console.warn(`Invalid filter format: ${filter}`);
        return null;
      }

      const fieldId = decodeURIComponent(fieldIdWithPrefix);
      const field = viewConfigManager.getFieldBy(fieldId);

      if (!field) {
        console.warn(`Field ${fieldId} not found`);
        return null;
      }

      const decodedOperator = decodeURIComponent(operator);
      const decodedValue = decodeURIComponent(value);
      const decodedType = decodeURIComponent(type);

      if (decodedType === 'relation') {
        const values = decodedValue
          .split(',')
          .map((v) => makeRow(v, v, v, field));
        return {
          field,
          operator: {
            label: decodedOperator as FilterOperatorTypeRelation['label'],
          },
          values,
          type: 'relation',
        };
      } else {
        return {
          field,
          operator: {
            label: decodedOperator as FilterOperatorTypePrimitive['label'],
          },
          value: makeRow(decodedValue, decodedValue, decodedValue, field),
          type: 'primitive',
        };
      }
    })
    .filter(Boolean) as FilterType[];
};
