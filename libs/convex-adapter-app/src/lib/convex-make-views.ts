import {
  BaseConfigInterface,
  patchAllViews,
  RegisteredViews,
  ViewConfigType,
} from '@apps-next/core';
import {
  _createViewConfig,
  createViewConfig,
  generateDefaultViewConfigs,
} from '@apps-next/react';

export const makeViews = (
  globalConfig: BaseConfigInterface,
  partialViews: ReturnType<typeof _createViewConfig>[]
): RegisteredViews => {
  const views = partialViews.map((partialView) => {
    return createViewConfig(
      partialView.tableName,
      partialView.configOptions,
      globalConfig
    );
  }) as ViewConfigType[];

  const defaultViewConfigs = generateDefaultViewConfigs({
    tableNames: globalConfig.tableNames,
    dataModel: globalConfig.dataModel,
    config: globalConfig,
    guessDisplayFieldIfNotProvided: true,
    userDefinedViews: views as ViewConfigType[],
  });

  const userDefinedViews = views.reduce((prev, currentView) => {
    return {
      ...prev,
      [currentView.viewName.toLowerCase()]: currentView as ViewConfigType,
    };
  }, {} as RegisteredViews);

  const patchedViews = patchAllViews(userDefinedViews);

  return {
    ...defaultViewConfigs,
    ...patchedViews,
  };
};
