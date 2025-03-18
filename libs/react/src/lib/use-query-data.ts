import { DataModelNew, RecordType } from '@apps-next/core';
import { observable } from '@legendapp/state';
import React from 'react';
import { ignoreNewData$ } from './legend-store/legend.mutationts';
import { store$ } from './legend-store/legend.store';
import { useQuery } from './use-query';

export type QueryStore<T extends RecordType> = {
  dataModel: DataModelNew<T>;

  relationalDataModel: {
    [key: string]: DataModelNew<T>;
  };
};

export const reset$ = observable({ value: 0 });

export const useQueryData = <QueryReturnType extends RecordType[]>(): Pick<
  QueryStore<QueryReturnType>,
  'dataModel' | 'relationalDataModel'
> => {
  const { data, relationalData, continueCursor, isDone } = useQuery();
  const dataModel = store$.dataModel.get() as DataModelNew<QueryReturnType>;
  const relationalDataModel = store$.relationalDataModel.get();

  const prevDataRef = React.useRef<RecordType[] | null>(null);

  const isDoneRef = React.useRef(false);

  const reset = store$.fetchMore.reset.get();
  // let timeout: NodeJS.Timeout | null = null;
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      isDoneRef.current = isDone;
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDone]);

  React.useEffect(() => {
    if (reset) {
      isDoneRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [reset]);

  React.useEffect(() => {
    const { isFetching, reset } = store$.fetchMore.get();

    if (data === undefined) return;

    if (isDoneRef.current) return;

    if (ignoreNewData$.get() > 0) {
      ignoreNewData$.set((prev) => prev - 1);
      return;
    }

    const allData =
      isFetching && !reset
        ? [...(prevDataRef.current ?? []), ...(data ?? [])]
        : data;

    store$.createDataModel(allData);

    store$.createRelationalDataModel(relationalData ?? {});

    store$.fetchMore.assign({
      currentCursor: store$.fetchMore.currentCursor.get(),

      nextCursor: continueCursor,
      isFetching: false,
      isFetched: true,
      reset: false,
      isDone: isDone,
    });

    isDoneRef.current = isDone;

    prevDataRef.current = allData;
  }, [continueCursor, data, relationalData, isDone]);

  return {
    dataModel,
    relationalDataModel,
  };
};
