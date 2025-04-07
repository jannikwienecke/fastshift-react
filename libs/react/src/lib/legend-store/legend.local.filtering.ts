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

export const addLocalFiltering = (store$: Observable<LegendStore>) => {
  store$.filter.filters.onChange((changes) => {
    const currentFilters = changes.value.map((f) => {
      if (f.field.type === 'Date') {
        const date = dateUtils.parseOption(
          filterUtil().getValue(f),
          f.operator
        );
        return {
          ...f,
          date,
        };
      }
      return f;
    });

    let rows: Row<RecordType>[] = [];

    const backup = store$.dataModelBackup.get();
    if (backup) {
      rows = backup.rows;
    } else {
      rows = store$.dataModel.rows.get().map((r) => copyRow(r));
      store$.dataModelBackup.set({ rows });
    }

    if (currentFilters.length === 0 || !currentFilters) {
      store$.dataModel.rows.set(rows);
      return;
    }

    const idsAdd: string[][] = [];
    const idsNotAdd: string[][] = [];

    for (const filter of currentFilters) {
      const ids: string[] = [];
      const negate = isNegateOperator(filter.operator);

      if (filter.field.type === 'Date' && filter.type === 'primitive') {
        const { start, end } = dateUtils.getStartAndEndDate(filter.date);

        const filteredRows = rows.filter((row) => {
          const value = row.getValue(filter.field.name);

          if (start && end) {
            return value >= start.getTime() && value <= end.getTime();
          } else if (end) {
            return value >= 0 && value <= end.getTime();
          } else if (start) {
            return value >= start.getTime();
          } else {
            return false;
          }
        });

        ids.push(...filteredRows.map((row) => row.id));
      } else if (filter.type === 'relation' && filter.field.enum) {
        const filteredRows = rows.filter((row) => {
          const valueOfField = row.getValue(filter.field.name);
          const hasValue = filter.values.some((v) => v.raw === valueOfField);

          return hasValue;
        });

        ids.push(...filteredRows.map((row) => row.id));
      } else if (
        filter.type === 'relation' &&
        !filter.field.relation?.manyToManyTable
      ) {
        const filterIds = filter.values.map((v) => (v as Row).id);
        const hasNoneId = filterIds.some((id) => id === NONE_OPTION);
        const fieldName = filter.field.name;

        const filteredRows = rows.filter((row) => {
          const valueOfField = row.getValue(fieldName);
          const id = (valueOfField as Row | undefined)?.id ?? undefined;

          if (hasNoneId && !id) {
            return true;
          }

          return id && filterIds.includes(id);
        });

        ids.push(...filteredRows.map((row) => row.id));
      } else if (filter.type === 'relation') {
        const filterIds = filter.values.map((v) => (v as Row).id);
        const hasNoneId = filterIds.some((id) => id === NONE_OPTION);
        const fieldName = filter.field.name;

        const filteredRows = rows.filter((row) => {
          const valuesOfField = row.getValue(fieldName) as Row[] | undefined;
          const ids = (valuesOfField ?? []).map((r) => r.id);

          if (hasNoneId && !ids?.length) {
            return true;
          }

          return ids && filterIds.some((id) => ids.includes(id));
        });

        ids.push(...filteredRows.map((row) => row.id));
      } else if (
        filter.type === 'primitive' &&
        filter.field.type === 'String'
      ) {
        const fuse = new Fuse(
          rows.map((r) => r.getValue(filter.field.name)),
          {
            keys: [filter.field.name],
            threshold: 0.3,
          }
        );
        const result = fuse.search(filter.value.id as string);

        const filteredRows = result.map((r) => {
          const row = rows.find(
            (row) => row.getValue(filter.field.name) === r.item
          ) as Row;
          return row;
        });

        ids.push(...filteredRows.map((row) => row.id));
      } else if (
        filter.type === 'primitive' &&
        filter.field.type === 'Boolean'
      ) {
        const filterValue = filter.value.id === 'true' ? true : false;
        const fieldName = filter.field.name;

        const filteredRows = rows.filter((row) => {
          const valueOfField = row.getValue(fieldName);
          return valueOfField === filterValue;
        });

        ids.push(...filteredRows.map((row) => row.id));
      }

      if (negate) {
        idsNotAdd.push(ids);
      }
      if (!negate) {
        idsAdd.push(ids);
      }
    }

    const allIds = arrayIntersection(...idsAdd) ?? [];

    const filteredRows = rows.filter((row) => {
      const isInAllIds = allIds.some((id) => id === row.id);
      const isInIdsNotAdd = idsNotAdd.some((ids) => ids.includes(row.id));
      return isInAllIds && !isInIdsNotAdd;
    });

    store$.dataModel.rows.set(filteredRows);
  });
};
