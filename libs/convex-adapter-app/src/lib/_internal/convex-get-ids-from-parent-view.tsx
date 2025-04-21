import {
  BaseViewConfigManagerInterface,
  getViewByName,
  BaseViewConfigManager,
  ViewConfigType,
  QueryServerProps,
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
      console.log(
        'Sub View Fildering by: ',
        args.parentViewName,
        args.viewName
      );

      const parentView = getViewByName(
        args.registeredViews,
        args.parentViewName
      );
      const childView = getViewByName(args.registeredViews, args.viewName);

      const { manyToManyTable, manyToManyModelFields } =
        parentView?.viewFields?.[childView?.tableName]?.relation ?? {};

      const fieldnameSubView = manyToManyModelFields?.find(
        (f) => f.name === args.viewName
      )?.relation?.fieldName;

      const fieldName2 = manyToManyModelFields?.find(
        (f) => f.name === parentView?.tableName
      );

      if (
        manyToManyTable &&
        fieldnameSubView &&
        fieldName2?.relation?.fieldName
      ) {
        const manyManyView = getViewByName(
          args.registeredViews,
          manyToManyTable
        );

        const relationalViewConfig = new BaseViewConfigManager(
          manyManyView as unknown as ViewConfigType
        );
        const indexField = getIndexFieldByName(
          relationalViewConfig,
          fieldName2.relation.fieldName
        );

        const query = queryClient(ctx, manyToManyTable);

        const records = await query
          .withIndex(indexField.name, (q: any) =>
            q.eq(indexField.field, args.parentId)
          )
          .collect();

        if (records.length) {
          idsSubView = records.map((r) => r[fieldnameSubView]);
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
    return await handle();
  } catch (error) {
    console.log('Error in getIdsFromParentView', error);
    throw error;
  }
};
