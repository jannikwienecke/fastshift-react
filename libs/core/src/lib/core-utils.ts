import { TFunction } from 'i18next';
import { BaseViewConfigManagerInterface } from './base-view-config';
import { makeRow } from './data-model';
import { FieldConfig, ID, QUERY_KEY_PREFIX, RegisteredViews } from './types';
import { DisplayOptionsType } from './types/displayOptions.types';
import {
  DisplayOptionsUiType,
  FilterOperatorType,
  FilterType,
} from './types/filter.types';
import { TranslationKeys } from './translations';

export const invarant = (condition: boolean, message: string) => {
  const prefix = 'Invariant failed';

  if (condition) {
    return;
  }

  const label = message ? `${prefix}: ${message}` : prefix;
  throw new Error(label);
};

export const waitFor = (ms: number) => {
  const env = import.meta.env.MODE;
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
  displayOptions,
}: {
  viewName: string | undefined;
  query?: string | undefined;
  relation?: string | undefined;
  filters?: string | undefined;
  displayOptions?: string | undefined;
}) => {
  return [
    QUERY_KEY_PREFIX,
    viewName,
    query ?? '',
    relation ? '_relational_' + relation : '',
    filters ?? '',
    displayOptions ?? '',
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
        let isNumberValue = false;

        const values = filter.values
          .map((row) => {
            if (typeof row.raw === 'number') {
              isNumberValue = true;
            }
            return encodeURIComponent(filter.field.enum ? row.raw : row.id);
          })
          .join(',');

        return `filter[]=${fieldId}:${operator}:${values}:${filter.type};${isNumberValue}`;
      } else {
        const value = encodeURIComponent(filter.value.raw);
        return `filter[]=${fieldId}:${operator}:${value}:${filter.type};false`;
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
      // Updated regex to capture isNumber separately.
      const match = filter.match(
        /filter\[\]=([^:]+):([^:]+):([^:]+):([^;]+);(true|false)/
      );
      const [, fieldIdWithPrefix, operator, value, type, isNumber] =
        match || [];

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

      const decodedOperator = decodeURIComponent(operator ?? '');
      const decodedValue = decodeURIComponent(value ?? '');
      const decodedType = decodeURIComponent(type ?? '');

      if (decodedType === 'relation') {
        const values = decodedValue.split(',').map((value) => {
          const v = isNumber === 'true' ? Number(value) : value;

          return makeRow(v, value, v, field);
        });
        return {
          field,
          operator: {
            label: decodedOperator as FilterOperatorType['label'],
          },
          values,
          type: 'relation',
        };
      } else {
        return {
          field,
          operator: {
            label: decodedOperator as FilterOperatorType['label'],
          },
          value: makeRow(decodedValue, decodedValue, decodedValue, field),
          type: 'primitive',
        };
      }
    })
    .filter(Boolean) as FilterType[];
};

export const convertDisplayOptionsForBackend = (
  displayOptions: DisplayOptionsUiType
): string => {
  if (!displayOptions.sorting.field && !displayOptions.grouping) return '';

  const sortingString = displayOptions.sorting.field
    ? `sorting=${displayOptions.sorting.field.name}:${displayOptions.sorting.order}`
    : '';

  const groupingString = displayOptions.grouping.field
    ? `grouping=${displayOptions.grouping.field.name}`
    : '';

  const deletedString = displayOptions.showDeleted
    ? `showDeleted=${displayOptions.showDeleted}`
    : '';

  return [sortingString, groupingString, deletedString]
    .filter(Boolean)
    .join(';');
};

export const parseDisplayOptionsStringForServer = (
  displayOptionsString: string,
  viewConfigManager: BaseViewConfigManagerInterface
): DisplayOptionsType => {
  const options: DisplayOptionsType = {};

  if (displayOptionsString === '') return options;

  const pairs = displayOptionsString.split(';');

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    if (!key || !value) {
      return;
    }
    const [field, order] = value.split(':');

    if (key === 'sorting' && field) {
      const fieldConfig = viewConfigManager.getFieldBy(field);

      options.sorting = {
        ...options.sorting,
        field: fieldConfig,
        order: order as 'asc' | 'desc',
      };
    } else if (key === 'grouping' && field) {
      const fieldConfig = viewConfigManager.getFieldBy(field);

      options.grouping = {
        ...options.grouping,
        field: fieldConfig,
      };
    } else if (key === 'showDeleted') {
      options.showDeleted = value === 'true';
    } else {
      //
    }
  });

  return options;
};

export function arrayIntersection(...arrays: (ID[] | null)[]): ID[] | null {
  if (arrays.filter((a) => a != null).length === 0) return null;

  const allIds = [...new Set(arrays.filter((a) => a != null).flat())];

  const result = allIds.filter((value) => {
    return arrays
      .filter((a) => a != null)
      .every((array) => array?.includes(value));
  });

  return result;
}

export const getViewByName = (views: RegisteredViews, name: string) => {
  const viewConfigByViewName = Object.values(views).find(
    (v) => v?.viewName === name
  );

  if (viewConfigByViewName) return viewConfigByViewName;

  const viewConfigByTableName = Object.values(views).find(
    (v) => v?.tableName === name
  );

  if (!viewConfigByTableName) {
    console.error(views, name);
    throw new Error(`No View For ${name} found`);
  }

  return viewConfigByTableName;
};

export const makeDayMonthString = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
  });

  return formatter.format(date);
};

// export const renderField = (field: string, t: TFunction) => {
//   console.log(field);
//   let nameToRender = t(`viewFields.${field}.label`);
//   nameToRender = nameToRender.includes('viewFields.') ? t(field) : nameToRender;

//   return nameToRender;
// };

export const renderModelName = (
  modelName: string,
  t: (key: any, options?: Record<string, unknown>) => string,
  plural?: boolean
) => {
  const translated = plural ? t(`${modelName}.other`) : t(`${modelName}.one`);

  const test =
    translated.includes(`.other`) || translated.includes('.one')
      ? modelName
      : translated;

  return test;
};

export const translateField = (
  t: (key: any, options?: Record<string, unknown>) => string,
  field: { name: string; label?: string }
) => {
  const translated = t(field.label ?? field.name);

  return translated.includes(field.label ?? '')
    ? field.name.firstUpper()
    : translated;
};

export const patchDict = <T extends Record<string, any>>(
  dict: T,
  fn: (entry: T[keyof T]) => T[keyof T]
) => {
  return Object.entries(dict ?? {}).reduce((acc, [dictKey, entry]) => {
    // const xx = fn(fieldName, field)
    const updatedEntry = fn(entry);
    return {
      ...acc,
      [dictKey]: {
        ...entry,
        ...updatedEntry,
      },
    };
  }, dict);
};
