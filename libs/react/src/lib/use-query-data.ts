import { DataModelNew, RecordType } from '@apps-next/core';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { useQuery } from './use-query';
import { observable, observe } from '@legendapp/state';
import { ignoreNewData$ } from './legend-store/legend.mutationts';

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
  React.useEffect(() => {
    setTimeout(() => {
      isDoneRef.current = isDone;
    }, 100);
  }, [isDone]);

  React.useEffect(() => {
    if (reset) {
      isDoneRef.current = false;
    }
  }, [reset]);

  React.useEffect(() => {
    const { isFetching, reset } = store$.fetchMore.get();

    if (data === undefined) return;

    if (store$.fetchMore.isDone.get()) return;
    if (isDoneRef.current) return;

    if (ignoreNewData$.get()) {
      ignoreNewData$.set(false);
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
    // });
  }, [continueCursor, data, relationalData, isDone]);

  return {
    dataModel,
    relationalDataModel,
  };
};
