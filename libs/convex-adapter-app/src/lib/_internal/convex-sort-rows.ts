import { DisplayOptionsType } from '@apps-next/core';
import { ConvexRecord } from './types.convex';

export const convexSortRows = (
  rows: ConvexRecord[],
  displayOptions?: DisplayOptionsType
) => {
  if (!displayOptions) return rows;

  const sorting = displayOptions.sorting;
  const { field, order } = sorting ?? {};

  if (!field) return rows;
  if (!order) return rows;

  rows.sort((a, b) => {
    const aField = a[field?.name];
    const bField = b[field?.name];

    if (aField < bField) return -1;
    if (aField > bField) return 1;
    return 0;
  });

  return rows;
};
