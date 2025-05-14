import { RecordType, RegisteredViews } from '@apps-next/core';
import { Change } from 'convex-helpers/server/triggers';
import { GenericMutationCtx } from 'convex/server';

export type TriggerFnProps = {
  tableName: string;
  views: RegisteredViews;
  ctx: GenericMutationCtx<any>;
  change: Change<any, any>;
};

export type TriggerFn = (
  props: TriggerFnProps & { owner: RecordType }
) => Promise<void>;

export type TriggerOperationFnDict = {
  insert: TriggerFn;
  delete: TriggerFn;
  update: TriggerFn;
};
