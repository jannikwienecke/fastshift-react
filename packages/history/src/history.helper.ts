import { DataType, HistoryType, Row, ViewConfigType } from '@apps-next/core';

export const getChangeValue = (
  value: DataType<'history'>,
  {
    relatedRow,
    oldRow,
    newRow,
    view,
  }: {
    relatedRow?: Row | null;
    oldRow?: Row | null;
    newRow?: Row | null;
    view?: ViewConfigType;
  }
): HistoryType['changed'] => {
  const defaultData = {
    oldValue: null,
    newValue: null,
    label: '',
    fieldName: '',
    id: '',
  } as const;

  const fieldName = value.change.field ?? '';

  if (!relatedRow && !oldRow && !newRow) {
    if (value.changeType === 'insert') {
      return {
        ...defaultData,
        type: 'created',
      };
    }

    if (value.changeType === 'update') {
      return {
        ...defaultData,
        type: 'changed',
        fieldName,
        newValue: value.change.newValue,
        oldValue: value.change.oldValue,
      };
    }
  }

  if (relatedRow) {
    if (value.changeType === 'insert') {
      return {
        ...defaultData,
        type: 'added',
        fieldName,
        label: relatedRow.label,
        id: relatedRow.id,
      };
    }

    if (value.changeType === 'delete') {
      return {
        ...defaultData,
        type: 'removed',
        fieldName,
        label: relatedRow.label,
        id: relatedRow.id,
      };
    }
  }

  if (newRow || oldRow) {
    const field = Object.values(view?.viewFields ?? {}).find((field) => {
      return field.relation?.fieldName === value.change.field;
    });

    if (value.changeType === 'update' && newRow) {
      return {
        type: 'added-to',
        fieldName: field?.name ?? '',
        label: newRow.label,
        oldValue: oldRow?.label ?? '',
        newValue: newRow.label,
        id: newRow.id,
      };
    }

    if (value.changeType === 'update' && !newRow && oldRow) {
      return {
        type: 'removed-from',
        fieldName: field?.name ?? '',
        label: oldRow.label,
        oldValue: oldRow.label,
        newValue: '',
        id: oldRow.id,
      };
    }
  }

  return {
    ...defaultData,
    type: 'created',
    fieldName: '',
  };
};
