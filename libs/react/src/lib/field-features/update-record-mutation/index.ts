import {
  HandleUpdateDict,
  UpdateRecordMutation,
  UpdateRecordPayload,
} from './feature.updateRecord.shared';
import { PrimitiveFieldUpdate } from './primitive-update-record';

const handleUpdateDict: HandleUpdateDict = {
  Number: PrimitiveFieldUpdate,
  String: PrimitiveFieldUpdate,
  Boolean: PrimitiveFieldUpdate,
  //   Reference: ReferenceFieldUpdate,
  //   OneToOneReference: ReferenceFieldUpdate,
  //   Enum: PrimitiveFieldUpdate,
};

export const handleSelectUpdate = (
  payload: UpdateRecordPayload
): UpdateRecordMutation => {
  const type = payload.field.type;
  const handleUpdate = handleUpdateDict[type];

  if (!handleUpdate) throw new Error('Field type is required');

  return handleUpdate(payload);
};
