import { RegisteredViews, ViewConfigType, ViewRegistry } from '@apps-next/core';
import { ProjectsMainPage } from './projects.view';
import { uiViewConfig } from './projects.ui-config';

export const register = (
  views: RegisteredViews,
  viewRegistry: ViewRegistry
) => {
  const config = views['projects'] as ViewConfigType<'projects'>;
  viewRegistry
    .addView(config as ViewConfigType)
    .addComponents({ main: ProjectsMainPage })
    .addUiConfig(uiViewConfig);
};
