import {
  BaseConfigInterface,
  BaseViewConfigManager,
  QueryDto,
  RegisteredViews,
  SearchableField,
  ViewConfigType,
} from '@apps-next/core';
import { ConvexViewConfig } from './convex-create-view-config';
import { generateDefaultViewConfigs } from '@apps-next/react';
import { GenericQueryCtx } from './_internal/convex.server.types';
import { viewLoaderHandler } from './convex-view-loader';

export class ConvexViewConfigManager extends BaseViewConfigManager<ConvexViewConfig> {
  override getSearchableField(): SearchableField | undefined {
    return this.viewConfig.query?.searchableFields;
  }
}

export const makeViews = (
  globalConfig: BaseConfigInterface,
  views: ViewConfigType[]
) => {
  // TODO: PRISAM and general -> need to be moved somethwre else. Cannot import from react in adapter
  const defaultViewConfigs = generateDefaultViewConfigs({
    tableNames: globalConfig.tableNames,
    dataModel: globalConfig.dataModel,
    config: globalConfig,
    guessDisplayFieldIfNotProvided: true,
  });

  const userDefinedViews = views.reduce((prev, currentView) => {
    return {
      ...prev,
      [currentView.viewName]: currentView,
    };
  }, {} as RegisteredViews);

  return {
    ...defaultViewConfigs,
    ...userDefinedViews,
  };
};

export const createViewLoaderHandler =
  (views: RegisteredViews) => (ctx: GenericQueryCtx, args: any) => {
    const viewConfig = views[args['viewName'] as any as keyof typeof views];

    return viewLoaderHandler(ctx, {
      ...(args as any),
      viewConfig,
      registeredViews: views,
    } satisfies QueryDto);
  };
