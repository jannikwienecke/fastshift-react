import {
  BaseViewConfigManagerInterface,
  getViewByName,
  BaseViewConfigManager,
  ViewConfigType,
  QueryServerProps,
  UserViewData,
} from '@apps-next/core';
import { queryClient } from './convex-client';
import { getIndexFieldByName } from './convex-utils';
import { GenericQueryCtx } from './convex.server.types';

export const getIdsFromParentView = async (
  args: QueryServerProps,
  ctx: GenericQueryCtx,
  viewConfigManager: BaseViewConfigManagerInterface
) => {
  let idsSubView = [] as string[];

  const handle = async () => {
    if (args.parentId && args.parentViewName && args.viewName) {
      let parentView = getViewByName(args.registeredViews, args.parentViewName);

      if (!parentView) {
        const allUserViews = (await ctx.db
          .query('views')
          .collect()) as UserViewData[];

        const parentViewName = allUserViews.find(
          (v) => v.name.toLowerCase() === args.parentViewName?.toLowerCase()
        )?.baseView;

        parentView = getViewByName(args.registeredViews, parentViewName ?? '');
      }

      const childView = getViewByName(args.registeredViews, args.viewName);

      // TODO Refactor and remove duplicated code todoId:1
      const manyToMany = Object.values(args.registeredViews).find(
        (v) =>
          v?.isManyToMany &&
          [parentView?.tableName, childView?.tableName].every((t) =>
            Object.keys(v.viewFields).includes(t)
          )
      );

      const manyToManyTable = manyToMany?.tableName;

      if (manyToManyTable && manyToMany) {
        const relationalViewConfig = new BaseViewConfigManager(
          manyToMany as unknown as ViewConfigType
        );

        const fieldNameParent = Object.values(manyToMany.viewFields).find(
          (f) => f.name === parentView?.tableName
        )?.relation?.fieldName;

        const fieldNameChild = Object.values(manyToMany.viewFields).find(
          (f) => f.name === childView?.tableName
        )?.relation?.fieldName;

        const indexField = getIndexFieldByName(
          relationalViewConfig,
          fieldNameParent ?? ''
        );

        const query = queryClient(ctx, manyToManyTable);

        const records = await query
          .withIndex(indexField.name, (q: any) =>
            q.eq(indexField.field, args.parentId)
          )
          .collect();

        if (records.length) {
          idsSubView = records.map((r) => r[fieldNameChild ?? '']);
        }
      } else if (childView && parentView) {
        const query = queryClient(ctx, childView.tableName);
        const parentViewFieldname =
          childView.viewFields?.[parentView.tableName]?.relation?.fieldName;

        if (parentViewFieldname) {
          const indexField = getIndexFieldByName(
            viewConfigManager,
            parentViewFieldname
          );

          const records = await query
            .withIndex(indexField.name, (q) =>
              q.eq(indexField.field, args.parentId)
            )
            .collect();

          if (records.length) {
            idsSubView = records.map((r) => r['_id']);
          }
        }
      }
    }

    return idsSubView;
  };

  try {
    const res = await handle();
    return res;
  } catch (error) {
    console.log('Error in getIdsFromParentView');
    throw error;
  }
};
