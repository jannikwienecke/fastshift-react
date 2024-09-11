import {
  BaseConfigInterface,
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
