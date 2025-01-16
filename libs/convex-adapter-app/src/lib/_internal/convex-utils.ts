import { RecordType } from '@apps-next/core';
import { ConvexRecordType } from './types.convex';

export const parseConvexData = (
  data?: ConvexRecordType[] | null
): RecordType[] => {
  return data?.map((r: ConvexRecordType) => ({
    id: r._id,

    ...r,
  })) as RecordType[];
};
