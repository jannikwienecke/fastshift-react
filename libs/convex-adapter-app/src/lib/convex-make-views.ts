import {
  BaseConfigInterface,
  patchAllViews,
  RegisteredViews,
  ViewConfigType,
} from '@apps-next/core';
import { generateDefaultViewConfigs } from '@apps-next/react';

export const makeViews = (
  globalConfig: BaseConfigInterface,
  views: ViewConfigType[]
) => {
  const defaultViewConfigs = generateDefaultViewConfigs({
    tableNames: globalConfig.tableNames,
    dataModel: globalConfig.dataModel,
    config: globalConfig,
    guessDisplayFieldIfNotProvided: true,
    userDefinedViews: views,
  });

  const userDefinedViews = views.reduce((prev, currentView) => {
    return {
      ...prev,
      [currentView.viewName.toLowerCase()]: currentView,
    };
  }, {} as RegisteredViews);

  const patchedViews = patchAllViews(userDefinedViews);

  return {
    ...defaultViewConfigs,
    ...patchedViews,
  };
};
