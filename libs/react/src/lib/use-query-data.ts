import { DataModelNew, RecordType } from '@apps-next/core';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { useQuery } from './use-query';
import { observable, observe } from '@legendapp/state';

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

  React.useEffect(() => {
    observe(reset$, () => {
      if (data === undefined) return;

      const allData = [...(prevDataRef.current ?? []), ...(data ?? [])];
      store$.createDataModel(allData);

      store$.createRelationalDataModel(relationalData ?? {});

      store$.fetchMore.assign({
        currentCursor: store$.fetchMore.nextCursor.get(),
        nextCursor: continueCursor,
        isFetching: false,
        isFetched: true,
        isDone: isDone,
      });

      prevDataRef.current = allData;
    });
  }, [continueCursor, data, relationalData, isDone]);

  return {
    dataModel,
    relationalDataModel,
  };
};
