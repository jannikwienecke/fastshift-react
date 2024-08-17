import { Merge, RegisteredRouter } from '@apps-next/core';
import { Infer } from 'convex/values';

export type GetTableName =
  keyof RegisteredRouter['config']['dataModel']['tables'];

export type GetTableDataType<T extends GetTableName> = Merge<
  Infer<RegisteredRouter['config']['dataModel']['tables'][T]['validator']>,
  {
    id: string;
  }
>;
