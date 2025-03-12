import {
  DisplayOptionsType,
  getViewByName,
  QueryServerProps,
} from '@apps-next/core';
import { ConvexRecord } from './types.convex';

export const convexSortRows = (
  rows: ConvexRecord[],
  serverProps: QueryServerProps,
  displayOptions?: DisplayOptionsType
) => {
  if (!displayOptions) return rows;

  const sorting = displayOptions.sorting;
  const ascending = sorting?.order === 'asc';

  const { field, order } = sorting ?? {};

  if (!field) return rows;
  if (!order) return rows;

  const displayFieldName = getViewByName(
    serverProps.registeredViews,
    field.name
  ).displayField.field;

  console.log('sorting', field.name, order);

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

    if (typeof aField === 'object' && typeof bField === 'object') {
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

    // FEATURE: Add support for sorting by Project of Task if Grouping by Project is set

    return 0;
  });

  return rows;
};
