import {
  DisplayOptionsType,
  QueryServerProps,
  sortRows,
} from '@apps-next/core';
import { ConvexRecord } from './types.convex';

export const convexSortRows = (
  rows: ConvexRecord[],
  serverProps: QueryServerProps,
  displayOptions?: DisplayOptionsType
) => {
  if (!displayOptions?.sorting) {
    return rows
      .sort((a, b) => {
        const aTime = a._creationTime ?? 0;
        const bTime = b._creationTime ?? 0;

        return aTime > bTime ? -1 : aTime < bTime ? 1 : 0;
      })
      .reverse();
  }

  return sortRows(rows, serverProps.registeredViews, {
    field: displayOptions.sorting?.field,
    order: displayOptions.sorting?.order,
  });
};
