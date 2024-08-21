import { ID } from '@apps-next/core';
import { Id } from './convex.server.types';
import { RecordType } from './types.convex';

type Patch = (id: ID, data: RecordType) => Promise<Id<any>>;
type Delete = (id: ID) => Promise<Id<any>>;
type Insert = (tableName: string, data: RecordType) => Promise<Id<any>>;

export type ConvexContext = {
  db: {
    patch: Patch;
    delete: Delete;
    insert: Insert;
  };
};
