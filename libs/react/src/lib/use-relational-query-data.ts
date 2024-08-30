import {
  BaseViewConfigManager,
  Model,
  RecordType,
  useStoreValue,
  viewsHelperAtom,
} from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import {
  comboboxAtom,
  updateValuesAtom,
} from './ui-adapter/combox-adapter/combobox.store';
import { useRelationalQuery } from './use-query-relational';
import { useQueryData } from './use-query-data';

type RelationalQueryStore<T extends RecordType> = {
  [key: string]: {
    dataModel: Model<T>;
    dataRaw: T[];
  };
};

const relationalQueryStoreAtom = atom<RelationalQueryStore<RecordType>>({});

export const updateRelationalQueryDataAtom = atom(
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
        isFetching: false,
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

export const isFetchingRelationalQueryAtom = atom(
  null,
  (get, set, props: { identifier: string }) => {
    set(comboboxAtom, {
      ...get(comboboxAtom),
      [props.identifier]: {
        ...get(comboboxAtom)[props.identifier],
        isFetching: true,
      },
    });
  }
);

export const useRelationalQueryData = <
  QueryReturnType extends RecordType[]
>(props: {
  tableName: string;
  recordId?: string;
  query?: string;
  identifier: string;
}): {
  dataModel: Model<QueryReturnType>;
  dataRaw: RecordType[];
} => {
  const queryStore = useAtomValue(relationalQueryStoreAtom);
  const updateQueryData = useSetAtom(updateRelationalQueryDataAtom);
  const setFetching = useSetAtom(isFetchingRelationalQueryAtom);

  const { data, isFetching } = useRelationalQuery(props);
  const { relationalDataModel } = useQueryData();
  const { list } = useStoreValue();

  const wasUpdatedRef = React.useRef(false);

  const defaultRelationalData = relationalDataModel?.[props.tableName];

  React.useEffect(() => {
    if (isFetching) {
      setFetching({ identifier: props.identifier });
      wasUpdatedRef.current = false;
    }
  }, [isFetching, props.identifier, setFetching]);

  React.useEffect(() => {
    wasUpdatedRef.current = false;
  }, [props.tableName]);

  React.useEffect(() => {
    wasUpdatedRef.current = false;
  }, [list?.focusedRelationField]);

  React.useEffect(() => {
    if (isFetching) return;
    if (wasUpdatedRef.current) return;
    if (!defaultRelationalData) return;

    wasUpdatedRef.current = true;

    const defaultValues = defaultRelationalData
      .getRows()
      .map((i) => i.getRawData());

    const currentValue = list?.focusedRelationField?.row.getItemValue(
      props.tableName
    );

    const _currentValue = Array.isArray(currentValue)
      ? currentValue
      : [currentValue];

    const all = [
      ..._currentValue.filter(Boolean),
      ...(data ?? []),
      ...defaultValues,
    ];
    const allIds = Array.from(new Set(all.map((item) => item.id)));

    const unique = allIds
      .map((id) => all.find((item) => item.id === id))
      .filter(Boolean) as RecordType[];

    unique.sort((a, b) => {
      const aInData = data?.find((item) => item.id === a.id);
      const bInData = data?.find((item) => item.id === b.id);

      if (aInData && !bInData) return -1;
      if (!aInData && bInData) return 1;
      return 0;
    });

    updateQueryData({
      dataRaw: unique,
      tableName: props.tableName,
      identifier: props.identifier,
    });
  }, [
    data,
    defaultRelationalData,
    isFetching,
    list?.focusedRelationField?.row,
    props.identifier,
    props.tableName,
    relationalDataModel,
    updateQueryData,
  ]);

  return queryStore[props.tableName];
};
