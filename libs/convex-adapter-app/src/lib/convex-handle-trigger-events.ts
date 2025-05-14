import { getViewByName, isSystemField, RegisteredViews } from '@apps-next/core';
import {
  TriggerFn,
  TriggerFnProps,
  TriggerOperationFnDict,
} from './_internal/convex.triggers.types';

const helper = (views: RegisteredViews, tableName: string) => {
  const viewConfig = getViewByName(views, tableName);

  const getManyToManyFields = () => {
    const field1 = Object.values(viewConfig?.viewFields ?? {}).find(
      (field) => field.relation?.manyToManyModelFields
    );
    const field2 = Object.values(viewConfig?.viewFields ?? {}).find(
      (field) =>
        field.relation?.manyToManyModelFields && field.name !== field1?.name
    );

    const fieldName1 = field1?.relation?.fieldName;
    const fieldName2 = field2?.relation?.fieldName;

    return { field1, field2, fieldName1, fieldName2 };
  };

  const getIsManyToMany = () => {
    return viewConfig?.isManyToMany || false;
  };

  return {
    viewConfig,
    getIsManyToMany,
    getManyToManyFields,
  };
};

export const handleInsertTrigger: TriggerFn = async ({
  tableName,
  views,
  ctx,
  change,
  owner,
}) => {
  const { getManyToManyFields, getIsManyToMany } = helper(views, tableName);
  const newData = change.newDoc;

  if (getIsManyToMany()) {
    const { field1, field2, fieldName1, fieldName2 } = getManyToManyFields();

    await ctx.db.insert('history', {
      entityId: newData[fieldName1 as keyof typeof newData],
      changeType: 'insert',
      change: {
        field: field2?.name,
        oldValue: null,

        isManyToMany: true,
        manyToManyOf: tableName,

        newValue: newData[fieldName2 as keyof typeof newData],
      },
      ownerId: owner._id,
      timestamp: Date.now(),
      tableName: field1?.name,
    });

    await ctx.db.insert('history', {
      entityId: newData[fieldName2 as keyof typeof newData],
      changeType: 'insert',
      change: {
        field: field1?.name,
        oldValue: null,
        newValue: newData[fieldName1 as keyof typeof newData],
        isManyToMany: true,
        manyToManyOf: tableName,
      },
      ownerId: owner._id,
      timestamp: Date.now(),
      tableName: field2?.name,
    });
  } else {
    await ctx.db.insert('history', {
      entityId: newData._id,
      changeType: 'insert',
      change: {
        field: undefined,
        oldValue: null,
        newValue: newData,
      },
      ownerId: owner._id,
      timestamp: Date.now(),
      tableName,
    });
  }
};

export const handleDeleteTrigger: TriggerFn = async ({
  tableName,
  views,
  ctx,
  change,
  owner,
}) => {
  const { getManyToManyFields, getIsManyToMany } = helper(views, tableName);

  const oldData = change.oldDoc;

  if (!getIsManyToMany()) return;

  const { field1, field2, fieldName1, fieldName2 } = getManyToManyFields();

  await ctx.db.insert('history', {
    entityId: oldData[fieldName2 as keyof typeof oldData],
    changeType: 'delete',
    change: {
      field: field1?.name,
      oldValue: oldData[fieldName1 as keyof typeof oldData],
      newValue: null,
      isManyToMany: true,
      manyToManyOf: tableName,
    },
    ownerId: owner._id,
    timestamp: Date.now(),
    tableName: field2?.name,
  });

  await ctx.db.insert('history', {
    entityId: oldData[fieldName1 as keyof typeof oldData],
    changeType: 'delete',
    change: {
      field: field2?.name,
      newValue: null,
      oldValue: oldData[fieldName2 as keyof typeof oldData],
      isManyToMany: true,
      manyToManyOf: tableName,
    },
    ownerId: owner._id,
    timestamp: Date.now(),
    tableName: field1?.name,
  });
};

export const handleUpdateTrigger: TriggerFn = async ({
  tableName,
  views,
  ctx,
  change,
  owner,
}) => {
  const { getIsManyToMany } = helper(views, tableName);

  const newData = change.newDoc;
  const oldData = change.oldDoc;

  if (getIsManyToMany()) return;

  const changedFields = Object.keys(newData).filter((key) => {
    const oldFieldData = oldData ? oldData[key as keyof typeof oldData] : null;
    const newFieldData = newData[key as keyof typeof newData];

    const isArrayField = Array.isArray(newData[key as keyof typeof newData]);
    const isObjectField =
      typeof newData[key as keyof typeof newData] === 'object';
    const isInternalField = isSystemField(key as string);

    if (isArrayField) return false;
    if (isInternalField) return false;
    if (!oldFieldData && !newFieldData) return false;

    if (isObjectField && !oldFieldData) return true;

    if (isObjectField) {
      const isEqual =
        JSON.stringify(oldFieldData) === JSON.stringify(newFieldData);
      if (isEqual) return false;
      return true;
    }

    return (
      newData[key as keyof typeof newData] !==
      oldData[key as keyof typeof oldData]
    );
  });

  for (const field of changedFields) {
    const oldValue = oldData[field as keyof typeof oldData];
    const newValue = newData[field as keyof typeof newData];

    await ctx.db.insert('history', {
      entityId: change.newDoc._id,
      changeType: 'update',
      change: {
        field,
        oldValue,
        newValue,
      },
      ownerId: owner._id,
      timestamp: Date.now(),
      tableName,
    });
  }
};

export const handleTriggerChanges = async (props: TriggerFnProps) => {
  const { ctx, change } = props;

  const user = await ctx.db.query('users').first();

  const owner = await ctx.db
    .query('owner')
    .withIndex('userId', (q) => q.eq('userId', user._id))
    .first();

  if (!owner) {
    console.error('No owner found');
    return;
  }

  const dict: TriggerOperationFnDict = {
    insert: handleInsertTrigger,
    delete: handleDeleteTrigger,
    update: handleUpdateTrigger,
  };

  const fnToRun = dict[change.operation];

  if (!fnToRun) {
    throw new Error(`No function found for operation: ${change.operation}`);
  }

  try {
    await fnToRun({ ...props, owner });
  } catch (error) {
    console.error('Error handling trigger change:', error);
    throw error;
  }
};
