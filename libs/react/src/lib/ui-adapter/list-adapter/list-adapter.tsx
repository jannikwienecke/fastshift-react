import {
  clientConfigAtom,
  DataRow,
  getViewConfigAtom,
  RecordType,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import { ListItem, ListProps } from '@apps-next/ui';
import { useAtomValue } from 'jotai';
import { Icon } from '../../ui-components/render-icon';
import { useMutation } from '../../use-mutation';
import { useQueryData } from '../../use-query-data';
import { useCombobox } from '../combox-adapter';

type ListGetProps<T> = {
  fieldsLeft: (keyof T)[];
  fieldsRight: (keyof T)[];
};

export const useList = <T extends RecordType>() => {
  const dispatch = useStoreDispatch();

  const { dataModel } = useQueryData<T[]>();
  const { mutate } = useMutation();
  const { selected } = useStoreValue();

  // TODO: FIX NAMING -> OR MERGE THEM clientConfigAtom and getViewConfigAtom
  const config = useAtomValue(clientConfigAtom);
  const viewConfig = useAtomValue(getViewConfigAtom);

  return <Props extends ListGetProps<T>>(
    options?: Props
  ): ListProps<T & ListItem> => {
    const { list } = viewConfig.viewConfig.ui || {};
    const fieldsLeft = options?.fieldsLeft ?? list?.fieldsLeft ?? [];
    const fieldsRight = options?.fieldsRight ?? list?.fieldsRight ?? [];
    const _renderLabel = fieldsLeft.length === 0 && list?.useLabel !== false;

    const renderFields = (
      row: DataRow<T>,
      fields: (keyof T)[]
    ): ListProps['items'][0]['valuesLeft'] => {
      return (
        fields?.map((fieldName) => {
          const field = row.getItem(fieldName)?.field;

          return {
            id: row.getItemName(fieldName),
            name: row.getItemLabel(fieldName),

            relation: field?.relation
              ? {
                  ...field.relation,
                  useCombobox: useCombobox,
                }
              : undefined,
            render: () => {
              const ListComponent = config?.fields[fieldName]?.component?.list;

              return (
                <span
                  role="button"
                  onClick={() => {
                    if (!field) return;
                    if (!field.relation) return;

                    dispatch({
                      type: 'SELECT_RELATIONAL_FIELD',
                      field,
                    });
                  }}
                >
                  {ListComponent ? (
                    <>
                      <ListComponent data={row} />
                    </>
                  ) : (
                    <>{row.getItemLabel(fieldName)}12</>
                  )}
                </span>
              );
            },
          };
        }) ?? []
      );
    };

    const renderLabel = (item: DataRow<T>) => {
      return [
        {
          id: item.id,
          name: item.label,
          render: () => <span>{item.label}</span>,
        },
      ];
    };

    return {
      onSelect: (item) => dispatch({ type: 'SELECT_RECORD', record: item }),
      selected,
      items:
        dataModel.getRows()?.map((item) => ({
          ...item.getRow(),
          id: item.id,
          icon: Icon,
          valuesLeft: _renderLabel
            ? renderLabel(item)
            : renderFields(item, fieldsLeft),
          valuesRight: renderFields(item, fieldsRight),
        })) ?? [],
    };
  };
};
