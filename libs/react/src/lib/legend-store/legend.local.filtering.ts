import {
  NONE_OPTION,
  RecordType,
  Row,
  arrayIntersection,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';
import Fuse from 'fuse.js';
import {
  dateUtils,
  filterUtil,
  isNegateOperator,
} from '../ui-adapter/filter-adapter';
import { LegendStore } from './legend.store.types';
import { copyRow } from './legend.utils';

const getFilteredRowsByIds = (rows: Row<RecordType>[], ids: string[]) => {
  return ids.map((id) => rows.find((row) => row.id === id) as Row);
};

const handleDateFilter = (rows: Row<RecordType>[], filter: any) => {
  const { start, end } = dateUtils.getStartAndEndDate(filter.date);
  return rows.filter((row) => {
    const value = row.getValue(filter.field.name);
    if (start && end) return value >= start.getTime() && value <= end.getTime();
    if (end) return value >= 0 && value <= end.getTime();
    if (start) return value >= start.getTime();
    return false;
  });
};

const handleRelationFilter = (rows: Row<RecordType>[], filter: any) => {
  const filterIds = filter.values.map((v: any) => (v as Row).id);
  const hasNoneId = filterIds.some((id: string) => id === NONE_OPTION);
  const fieldName = filter.field.name;

  return rows.filter((row) => {
    const value = row.getValue(fieldName);

    if (filter.field.enum) {
      return filter.values.some((v: any) => v.raw === value);
    }

    if (filter.field.relation?.manyToManyTable) {
      const values = value as Row[] | undefined;
      const ids = (values ?? []).map((r) => r.id);
      if (hasNoneId && !ids?.length) return true;
      return ids && filterIds.some((id: string) => ids.includes(id));
    }

    const id = (value as Row | undefined)?.id ?? undefined;
    if (hasNoneId && !id) return true;
    return id && filterIds.includes(id);
  });
};

const handleStringFilter = (rows: Row<RecordType>[], filter: any) => {
  const fuse = new Fuse(
    rows.map((r) => r.getValue(filter.field.name)),
    { keys: [filter.field.name], threshold: 0.3 }
  );
  const result = fuse.search(filter.value.id as string);
  return getFilteredRowsByIds(
    rows,
    result.map((r) => {
      const row = rows.find(
        (row) => row.getValue(filter.field.name) === r.item
      ) as Row;
      return row.id;
    })
  );
};

const handleBooleanFilter = (rows: Row<RecordType>[], filter: any) => {
  const filterValue = filter.value.id === 'true';
  return rows.filter((row) => row.getValue(filter.field.name) === filterValue);
};

export const addLocalFiltering = (store$: Observable<LegendStore>) => {
  store$.filter.filters.onChange((changes) => {
    const currentFilters = changes.value.map((f) => ({
      ...f,
      ...(f.field.type === 'Date' && {
        date: dateUtils.parseOption(filterUtil().getValue(f), f.operator),
      }),
    }));

    const backup = store$.dataModelBackup.get();

    const rows: Row<RecordType>[] = backup
      ? [...backup.rows]
      : store$.dataModel.rows.get().map((r) => copyRow(r));
    if (!backup) store$.dataModelBackup.set({ rows });

    if (!currentFilters.length) {
      store$.dataModel.rows.set(rows);
      return;
    }

    const [idsAdd, idsNotAdd] = currentFilters.reduce(
      ([add, notAdd], filter) => {
        const negate = isNegateOperator(filter.operator);
        let filteredRows: Row<RecordType>[] = [];

        if (filter.field.type === 'Date' && filter.type === 'primitive') {
          filteredRows = handleDateFilter(rows, filter);
        } else if (filter.type === 'relation') {
          filteredRows = handleRelationFilter(rows, filter);
        } else if (filter.type === 'primitive') {
          if (filter.field.type === 'String') {
            filteredRows = handleStringFilter(rows, filter);
          } else if (filter.field.type === 'Boolean') {
            filteredRows = handleBooleanFilter(rows, filter);
          }
        }

        const ids = filteredRows.map((row) => row.id);
        negate ? notAdd.push(ids) : add.push(ids);
        return [add, notAdd];
      },
      [[] as string[][], [] as string[][]]
    );

    const allIds = arrayIntersection(...idsAdd) ?? [];
    const filteredRows = rows.filter(
      (row) =>
        allIds.some((id) => id === row.id) &&
        !idsNotAdd.some((ids) => ids.includes(row.id))
    );

    store$.dataModel.rows.set(filteredRows);
  });
};
