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

export const getErrorMessage = (error: unknown): string => {
  return (
    (error as Error | undefined)?.message ??
    JSON.stringify(error) ??
    'UNKNOWN ERROR'
  );
};
