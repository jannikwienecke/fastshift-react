import { table } from 'console';
import { BaseViewConfigManagerInterface } from './base-view-config';
import { INTERNAL_FIELDS } from './core.constants';
import { makeRow, Row } from './data-model';
import { t, TranslationKeys } from './translations';
import {
  FieldConfig,
  FieldConfigOptions,
  ID,
  QUERY_KEY_PREFIX,
  RecordType,
  RegisteredViews,
  UserViewData,
  ViewConfigType,
} from './types';
import { DisplayOptionsType } from './types/displayOptions.types';
import {
  DisplayOptionsUiType,
  FilterOperatorType,
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

// export const waitFor = (ms: number) => {
//   const env = import.meta.env.MODE;
//   if (!env || env === 'development') {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   return Promise.resolve();
// };

export const makeQueryKey = ({
  viewName,
  query,
  relation,
  filters,
  displayOptions,
}: {
  viewName: string;
  query: string | null;
  relation: string | null;
  filters: string | null;
  displayOptions: string | null;
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
            const id = filter.field.enum ? row.raw : row.id;
            const label = filter.type === 'relation' ? row.label : row.raw;
            return `${encodeURIComponent(id)}||${encodeURIComponent(label)}`;
          })
          .join(',');

        return `filter[]=${fieldId}:${operator}:${values}:${filter.type};${isNumberValue}`;
      } else {
        const value = encodeURIComponent(filter.value.raw);
        const label = encodeURIComponent(
          filter.value.label || filter.value.raw
        );
        return `filter[]=${fieldId}:${operator}:${value}||${label}:${filter.type};false`;
      }
    })
    .join('&');
};
// how to parse this string into a filter object?
export const parseFilterStringForServer = (
  filterString: string,
  viewConfigManager: BaseViewConfigManagerInterface
): FilterType[] => {
  if (!filterString) return [];

  const filters = filterString.split('&');
  return filters
    .map((filter) => {
      // Updated regex to correctly parse label and type, ensuring it handles encoded values properly.
      const match = filter.match(
        /filter\[\]=([^:]+):([^:]+):([^:]*\|\|[^:]*):([^:]+);(true|false)/
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
      const decodedType = decodeURIComponent(type ?? '');
      const decodedValue = decodeURIComponent(value ?? '');

      if (decodedType === 'relation') {
        const values = decodedValue.split(',').map((value) => {
          // const v = isNumber === 'true' ? Number(value) : value;
          const _value = value.split('||')?.[0];
          const _label = value.split('||')?.[1];

          const v = isNumber === 'true' ? Number(_value) : _value;

          return makeRow(v, _label, v, field);
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
        const splitted = decodedValue.split('||');
        const value = splitted[0];
        const label = splitted[1];
        return {
          field,
          operator: {
            label: decodedOperator as FilterOperatorType['label'],
          },
          value: makeRow(value, label ?? value, value, field),
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

  const {
    grouping,
    sorting,
    showDeleted,
    showEmptyGroups,
    viewField,
    viewType,
  } = displayOptions;
  const sortingString = sorting?.field
    ? `sorting=${sorting.field.name}:${sorting.order}`
    : '';

  const groupingString = grouping?.field
    ? `grouping=${grouping.field.name}`
    : '';

  const deletedString = showDeleted ? `showDeleted=${showDeleted}` : '';

  const showEmptyGroupsString = showEmptyGroups
    ? `showEmptyGroups=${showEmptyGroups}`
    : '';

  const viewFieldString = viewField?.visible
    ? `viewField=${viewField.visible.join(',')}`
    : '';

  const viewTypeString = viewType ? `viewType=${viewType.type}` : '';

  return [
    sortingString,
    groupingString,
    deletedString,
    showEmptyGroupsString,
    viewFieldString,
    viewTypeString,
  ]
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
    } else if (key === 'showEmptyGroups') {
      options.showEmptyGroups = value === 'true';
    } else if (key === 'viewField') {
      options.selectedViewFields = value.split(',').map((v) => v);
    } else if (key === 'viewType') {
      options.viewType = value as DisplayOptionsUiType['viewType']['type'];
    }
  });

  return options;
};

export function arrayIntersection(
  ...arrays: (ID[] | null | ID[][])[]
): ID[] | null {
  if (arrays.filter((a) => a != null).length === 0) return null;

  const allIds = [...new Set(arrays.filter((a) => a != null).flat())].flat();

  const arrays_ = [] as ID[][];
  arrays.forEach((array) => {
    if (Array.isArray(array?.[0])) {
      for (const subArray of array) {
        arrays_.push(subArray as ID[]);
      }
    } else {
      arrays_.push(array as ID[]);
    }
  });

  const result = [...new Set(allIds)].filter((value) => {
    return arrays_
      .filter((a) => a != null)
      .every((array) => array?.includes(value));
  });

  return result;
}

export const getViewByName = (
  views: RegisteredViews,
  name: string,
  throwError?: boolean
) => {
  const viewConfigByViewName = Object.values(views).find(
    (v) => v?.viewName.toLowerCase() === name.toLowerCase()
  );

  if (viewConfigByViewName) return viewConfigByViewName;

  const viewConfigByTableName = Object.values(views).find(
    (v) => v?.tableName === name
  );

  if (!viewConfigByTableName && throwError) {
    console.error(views, name);
    throw new Error(`No View For "${name}" found`);
  }

  return viewConfigByTableName;
};

export const getUserViewByName = (
  userViewsList: UserViewData[],
  name: string
) => {
  return userViewsList.find((u) => u.name.toLowerCase() === name.toLowerCase());
};

export const makeDayMonthString = (date: Date | undefined) => {
  if (!date) return '';

  const formatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
  });

  return formatter.format(date);
};

export const makeDayMonthStringWithTime = (date: Date | undefined) => {
  if (!date) return '';
  const formatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(date);
};

export const toLocaleString = (
  field: FieldConfig,
  value?: string | number | null
) => {
  if (!value) return '';
  if (!field.isDateField) throw new Error('Field is not a date field');
  const date = new Date(+value);

  return field.dateFormatter
    ? field.dateFormatter(date)
    : date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
};

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

export const getFieldLabel = (
  field: FieldConfig,
  singular?: true,
  plural?: true
): string => {
  const isMany =
    field.relation?.type === 'manyToMany' || field.relation?.manyToManyRelation;

  const usePlural = (isMany && !singular) || plural ? true : false;

  const translatedName = t(`${field.name}.${usePlural ? 'other' : 'one'}`);

  const noTranslationName =
    translatedName === `${field.name}.${usePlural ? 'other' : 'one'}`;

  const fieldLabelToUse = noTranslationName
    ? field.name.firstUpper()
    : translatedName;

  return fieldLabelToUse;
};

export const getViewLabel = (view: ViewConfigType, singular?: true) => {
  const translatedName = t(`${view.tableName}.${!singular ? 'other' : 'one'}`);

  const noTranslationName =
    translatedName === `${view.tableName}.${!singular ? 'other' : 'one'}`;

  const fieldLabelToUse = noTranslationName
    ? view.tableName.firstUpper()
    : translatedName;

  return fieldLabelToUse;
};

export const getTableLabel = (tableName: string, singular?: true) => {
  const translatedName = t(`${tableName}.${!singular ? 'other' : 'one'}`);

  const noTranslationName =
    translatedName === `${tableName}.${!singular ? 'other' : 'one'}`;

  const fieldLabelToUse = noTranslationName
    ? tableName.firstUpper()
    : translatedName;

  return fieldLabelToUse;
};

export const getEditLabel = (
  field: FieldConfig,
  viewConfig: ViewConfigType,
  row?: Row | null
) => {
  const label = field.editLabel;

  const isMany =
    field.relation?.type === 'manyToMany' || field.relation?.manyToManyRelation;

  let translated = t(label || field.name, {
    model: getViewLabel(viewConfig, true),
  });

  let customTranslationToUse: null | string = null;
  const noTranslation = translated === label;

  let customToggleField = '';
  let toggleTranslationString = '';

  if (noTranslation) {
    const valueOfField = row ? row.getValue(field.name) : null;

    let booleanLabel = '';
    if (field.type === 'Boolean') {
      toggleTranslationString =
        valueOfField === true
          ? `${field.name}.unMarkAs`
          : `${field.name}.markAs`;

      customToggleField = t(toggleTranslationString);

      booleanLabel =
        (valueOfField as boolean) === true
          ? t('unmarkAs', {
              field: getFieldLabel(field),
            })
          : t('markAs', {
              field: getFieldLabel(field),
            });
    }

    const customChangeField = t(`${field.name}.changeField`);
    const customSetField = t(`${field.name}.setField`);
    const customChangeOrAdd = t(`${field.name}.changeOrAdd`);

    customTranslationToUse =
      customToggleField && customToggleField !== toggleTranslationString
        ? customToggleField
        : customChangeField !== `${field.name}.changeField`
        ? customChangeField
        : customSetField !== `${field.name}.setField`
        ? customSetField
        : customChangeOrAdd !== `${field.name}.changeOrAdd`
        ? customChangeOrAdd
        : null;

    const fallbackKey = booleanLabel
      ? booleanLabel
      : isMany
      ? 'changeOrAdd'
      : field.relation
      ? 'setField'
      : 'changeField';

    translated = t(`common.${fallbackKey}` as TranslationKeys, {
      field: getFieldLabel(field),
    });
  }

  return customTranslationToUse || translated;
};

export const sortRows = (
  rows: RecordType[],
  views: RegisteredViews,
  sorting?: {
    field?: FieldConfig;
    order?: 'asc' | 'desc';
  }
) => {
  if (!sorting?.field) return rows;

  const ascending = sorting?.order === 'asc';

  const { field, order } = sorting ?? {};

  if (!field) return rows;
  if (!order) return rows;

  const displayFieldName = field.relation
    ? getViewByName(views, field.name)?.displayField.field
    : null;

  rows.sort((a, b) => {
    const aField = a[field?.name];
    const bField = b[field?.name];

    if (aField === bField) return 0;
    if (aField === undefined) return 1;
    if (bField === undefined) return -1;

    if (typeof aField === 'string' && typeof bField === 'string') {
      return ascending
        ? aField.localeCompare(bField)
        : bField.localeCompare(aField);
    }
    if (typeof aField === 'number' && typeof bField === 'number') {
      return ascending ? aField - bField : bField - aField;
    }
    if (typeof aField === 'boolean' && typeof bField === 'boolean') {
      return ascending
        ? (aField ? 1 : 0) - (bField ? 1 : 0)
        : (bField ? 1 : 0) - (aField ? 1 : 0);
    }
    if (aField instanceof Date && bField instanceof Date) {
      return ascending
        ? aField.getTime() - bField.getTime()
        : bField.getTime() - aField.getTime();
    }
    if (Array.isArray(aField) && Array.isArray(bField)) {
      return ascending
        ? aField.length - bField.length
        : bField.length - aField.length;
    }

    if (
      typeof aField === 'object' &&
      typeof bField === 'object' &&
      displayFieldName
    ) {
      const nameA = aField[displayFieldName];
      const nameB = bField[displayFieldName];

      if (nameA === nameB) return 0;
      if (nameA === undefined) return 1;
      if (nameB === undefined) return -1;
      if (typeof nameA === 'string' && typeof nameB === 'string') {
        return ascending
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (typeof nameA === 'number' && typeof nameB === 'number') {
        return ascending ? nameA - nameB : nameB - nameA;
      }

      return ascending ? 1 : -1;
    }

    return 0;
  });

  return rows;
};

export const patchAllViews = (views: RegisteredViews) => {
  return patchDict(views ?? {}, (view) => {
    if (!view) return view;

    return {
      ...view,
      viewFields: patchDict(view.viewFields, (f) => {
        let relationalFieldConfig: FieldConfigOptions = {};
        if (f.relation?.fieldName) {
          relationalFieldConfig = view.fields?.[f.relation.fieldName] || {};
        }

        const fieldConfig = view.fields?.[f.name];
        const userFieldConfig = {
          ...relationalFieldConfig,
          ...fieldConfig,
        };
        const displayFIeld = view.displayField.field;
        const softDeleteField = view.mutation?.softDeleteField;

        const hideFieldFromForm = softDeleteField && softDeleteField === f.name;
        const isDisplayField =
          displayFIeld && f.name === displayFIeld ? true : undefined;

        return {
          ...f,
          ...userFieldConfig,
          isDisplayField,
          label: f.label || getFieldLabel(f),
          editLabel: `${f.name}.edit`,
          hideFromForm: hideFieldFromForm || userFieldConfig?.hideFromForm,
        } satisfies FieldConfig;
      }),
    };
  });
};

export const patchViewConfig = (viewConfig: ViewConfigType) => {
  const patechedViewFields = patchDict(viewConfig.viewFields, (f) => {
    const userFieldConfig = viewConfig.fields?.[f.name];
    const displayFIeld = viewConfig.displayField.field;
    const softDeleteField = viewConfig.mutation?.softDeleteField;

    const hideFieldFromForm = softDeleteField && softDeleteField === f.name;
    const isDisplayField =
      displayFIeld && f.name === displayFIeld ? true : undefined;

    return {
      ...f,
      ...(userFieldConfig ?? {}),
      label: f.label || `${f.name}.one`,
      isDisplayField: isDisplayField as true | undefined,
      editLabel: `${f.name}.edit`,
      hideFromForm: hideFieldFromForm || userFieldConfig?.hideFromForm,
    };
  });

  return {
    ...viewConfig,
    viewFields: patechedViewFields,
  } satisfies ViewConfigType;
};

export const slugHelper = () => {
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  };

  const unslugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/-/g, ' ') // Replace - with spaces
      .replace(/^\s+|\s+$/g, '') // Trim spaces from start and end of text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^\s+|\s+$/g, ''); // Trim spaces from start and end of text
  };

  return { slugify, unslugify };
};

export const isSystemField = (field: string) => {
  const isInternalField = Object.values(INTERNAL_FIELDS).some(
    (internalField) => internalField.fieldName === field
  );

  return isInternalField;
};
