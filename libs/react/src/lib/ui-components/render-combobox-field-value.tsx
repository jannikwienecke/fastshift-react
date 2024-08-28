import {
  DataItem,
  DataRow,
  getViewConfigAtom,
  queryStoreAtom,
  viewsHelperAtom,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { FieldValue } from './render-field-value';
import {
  comboboxStateAtom,
  State,
} from '../ui-adapter/combox-adapter/combobox.store';
import { ComboxboxItem } from '@apps-next/ui';

export const ComboboxFieldValue = ({
  fieldName,
  value,
  identifier,
  connectedRecordId,
}: {
  fieldName: string;
  value: ComboxboxItem;
  identifier: string;
  connectedRecordId: string;
}) => {
  const relationalViewHelper = useAtomValue(viewsHelperAtom);
  const viewConfigManager = useAtomValue(getViewConfigAtom);
  const { dataModel } = useAtomValue(queryStoreAtom);

  const { debouncedQuery, ...comboboxStateDict } =
    useAtomValue(comboboxStateAtom);

  const field = viewConfigManager.getFieldBy(fieldName);

  const state = comboboxStateDict.state?.[identifier as string] as
    | State
    | undefined;

  const row = state?.data?.getRows()?.find((item) => item.id === value.id);

  if (!row) return null;
  if (!state?.data) return null;

  const connectedRow = dataModel?.getRowById(connectedRecordId);
  if (!connectedRow) return null;

  const item = DataItem.create({
    id: row.id.toString(),
    field: field,
    label: row.label,
    name: fieldName,
    value: field.relation?.manyToManyRelation
      ? [row.getRawData()]
      : row.getRawData(),
  });

  const _row = DataRow.create(
    connectedRow.props,
    viewConfigManager,
    relationalViewHelper.get(fieldName).all
  );

  _row.updateItem(fieldName, item);

  return (
    <FieldValue fieldName={fieldName} componentType={'combobox'} row={_row} />
  );
};
