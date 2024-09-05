import { FieldConfig, FieldType, Row, UPDATE_RECORD } from '@apps-next/core';

export type UpdateRecordPayload = {
  field: FieldConfig;
  row: Row;
  value: Row;
  selected: string | Row[] | Row;
};

export type UpdateRecordMutation = UPDATE_RECORD;

export type HandleUpdate = (
  payload: UpdateRecordPayload
) => UpdateRecordMutation;

export type HandleUpdateDict = Partial<{
  [key in FieldType]: HandleUpdate;
}>;
