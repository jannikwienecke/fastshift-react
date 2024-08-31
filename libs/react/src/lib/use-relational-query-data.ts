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

  const { data, isFetching } = useRelationalQuery(props);
  const { relationalDataModel, dataModel } = useQueryData();
  const { list } = useStoreValue();

  const wasUpdatedRef = React.useRef(false);

  const defaultRelationalData = relationalDataModel?.[props.tableName];

  const currentValue: RecordType | RecordType[] | undefined =
    list?.focusedRelationField
      ? dataModel
          .getRowById(list?.focusedRelationField?.row.id)
          .getItemValue(props.tableName)
      : undefined;

  const _currentValue = React.useMemo(() => {
    return Array.isArray(currentValue) ? currentValue : [currentValue];
  }, [currentValue]);

  const defaultValues = React.useMemo(() => {
    return defaultRelationalData?.getRows().map((i) => i.getRawData());
  }, [defaultRelationalData]);

  React.useEffect(() => {
    wasUpdatedRef.current = false;
  }, [props.tableName, isFetching]);

  const defaultValuesRef = React.useRef(defaultValues);
  const propsRef = React.useRef(props);
  const _currentValueRef = React.useRef(_currentValue);
  const isFetchingRef = React.useRef(isFetching);
  const dataRef = React.useRef(data);

  React.useEffect(() => {
    dataRef.current = data;
    _currentValueRef.current = _currentValue;
    isFetchingRef.current = isFetching;
    propsRef.current = props;
    defaultValuesRef.current = defaultValues;
  }, [data, _currentValue, isFetching, props, defaultValues]);

  React.useEffect(() => {
    if (list?.focusedRelationField?.row.id) {
      wasUpdatedRef.current = false;

      updateQueryData({
        dataRaw: setAndSortData(
          defaultValuesRef.current,
          _currentValueRef.current
        ),
        tableName: propsRef.current.tableName,
        identifier: propsRef.current.identifier,
      });
    }
  }, [list?.focusedRelationField, updateQueryData]);

  React.useEffect(() => {
    if (props.query === '') {
      if (dataRef.current !== undefined && !isFetchingRef.current) {
        console.log('UPDATE Data 2 ');

        updateQueryData({
          dataRaw: setAndSortData(
            defaultValuesRef.current,
            _currentValueRef.current
          ),
          tableName: propsRef.current.tableName,
          identifier: propsRef.current.identifier,
        });
      }
    }
  }, [props.query, updateQueryData]);

  React.useEffect(() => {
    if (isFetching) return;
    if (wasUpdatedRef.current) return;
    if (!defaultRelationalData) return;
    if (!list?.focusedRelationField) return;

    wasUpdatedRef.current = true;

    const dataToShow = data && props.query ? data : defaultValues;
    const showCurrentValue = data && props.query ? false : true;
    updateQueryData({
      dataRaw: setAndSortData(
        dataToShow,
        showCurrentValue ? _currentValue : []
      ),
      tableName: props.tableName,
      identifier: props.identifier,
    });
  }, [
    _currentValue,
    data,
    defaultRelationalData,
    defaultValues,
    isFetching,
    list?.focusedRelationField,
    props.identifier,
    props.query,
    props.tableName,
    updateQueryData,
  ]);

  return queryStore[props.tableName];
};

const setAndSortData = (
  dataToShow: RecordType[],
  currentValue: RecordType[]
) => {
  const all = [...currentValue.filter(Boolean), ...(dataToShow ?? [])];
  const allIds = Array.from(new Set(all.map((item) => item.id)));

  const unique = allIds
    .map((id) => all.find((item) => item.id === id))
    .filter(Boolean) as RecordType[];

  // console.log(unique);
  // unique
  //   .sort((a, b) => {
  //     const aInData = dataToShow?.find((item) => item.id === a.id);
  //     const bInData = dataToShow?.find((item) => item.id === b.id);

  //     if (aInData && !bInData) return -1;
  //     if (!aInData && bInData) return 1;
  //     return 0;
  //   })
  //   .reverse();

  return unique;
};
