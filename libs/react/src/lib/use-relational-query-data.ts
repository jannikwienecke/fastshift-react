import {
  BaseViewConfigManager,
  Model,
  RecordType,
  viewsHelperAtom,
} from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useRelationalQuery } from './use-query-relational';
import { updateValuesAtom } from './ui-adapter/combox-adapter/combobox.store';

type RelationalQueryStore<T extends RecordType> = {
  [key: string]: {
    dataModel: Model<T>;
    dataRaw: T[];
  };
};

const relationalQueryStoreAtom = atom<RelationalQueryStore<RecordType>>({});

const updateRelationalQueryDataAtom = atom(
  null,
  (
    get,
    set,
    props: {
      tableName: string;
      dataRaw: RecordType[];
      identifier: string;
    }
  ) => {
    const relationalViewHelper = get(viewsHelperAtom);

    const { relationalView, all } = relationalViewHelper.get(props.tableName);

    const viewManager = new BaseViewConfigManager(relationalView);
    const model = Model.create(props.dataRaw ?? [], viewManager, all);

    const relationalQueryStore = get(relationalQueryStoreAtom);

    set(updateValuesAtom, {
      fieldName: props.identifier,
      state: {
        dataRaw: props.dataRaw,
        data: model,
        values: props.dataRaw.map((item) => ({
          id: item.id,
          label: item.label,
        })),
      },
    });

    set(relationalQueryStoreAtom, {
      ...relationalQueryStore,
      [props.identifier]: {
        dataModel: model,
        dataRaw: props.dataRaw,
      },
    });
  }
);

export const useRelationalQueryData = <
  QueryReturnType extends RecordType[]
>(props: {
  tableName: string;
  query?: string;
  identifier: string;
}): {
  dataModel: Model<QueryReturnType>;
  dataRaw: RecordType[];
} => {
  const queryStore = useAtomValue(relationalQueryStoreAtom);
  const updateQueryData = useSetAtom(updateRelationalQueryDataAtom);

  const { data } = useRelationalQuery(props);

  const propsRef = React.useRef(props);
  React.useEffect(() => {
    updateQueryData({
      dataRaw: data || [],
      tableName: propsRef.current.tableName,
      identifier: propsRef.current.identifier,
    });
  }, [data, updateQueryData]);

  return queryStore[props.tableName];
};
